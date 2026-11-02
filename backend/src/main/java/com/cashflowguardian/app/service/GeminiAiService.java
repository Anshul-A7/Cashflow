package com.cashflowguardian.app.service;

import com.cashflowguardian.app.domain.entity.AiInsight;
import com.cashflowguardian.app.domain.entity.Business;
import com.cashflowguardian.app.domain.entity.Customer;
import com.cashflowguardian.app.domain.entity.Invoice;
import com.cashflowguardian.app.domain.enums.CustomerRiskTier;
import com.cashflowguardian.app.domain.enums.InsightType;
import com.cashflowguardian.app.domain.enums.InvoiceStatus;
import com.cashflowguardian.app.repository.*;
import com.cashflowguardian.app.web.dto.AiDiagnosticResponse;
import com.cashflowguardian.app.web.dto.AiInsightDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiAiService {

    private final CashAccountRepository cashAccountRepository;
    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final CustomerRepository customerRepository;
    private final AiInsightRepository aiInsightRepository;
    private final BusinessRepository businessRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Transactional
    public AiDiagnosticResponse runFinancialDiagnostic(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Business not found: " + businessId));

        BigDecimal cashBalance = cashAccountRepository.sumBalance(businessId);
        BigDecimal receivables = invoiceRepository.sumTotalReceivables(businessId);
        BigDecimal overdue = invoiceRepository.sumOverdueReceivables(businessId, LocalDate.now());
        BigDecimal upcomingExpenses = expenseRepository.sumUpcomingPayables(businessId);
        BigDecimal past30DaysExpenses = expenseRepository.sumExpensesInPeriod(businessId, LocalDate.now().minusDays(30), LocalDate.now());

        List<Customer> customers = customerRepository.findAllByBusinessIdOrderByNameAsc(businessId);
        long highRiskCustomers = customers.stream()
                .filter(c -> c.getRiskTier() == CustomerRiskTier.CHRONIC_LATE || c.getRiskTier() == CustomerRiskTier.CRITICAL_DEFAULT_RISK)
                .count();

        // Check if Gemini key is available from property, environment, or .env files
        String apiKey = resolveGeminiApiKey();

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                log.info("Executing AI Financial Diagnostic with Google Gemini API (model: {})", geminiModel);
                return callGeminiApi(business, apiKey, cashBalance, receivables, overdue, upcomingExpenses, past30DaysExpenses, highRiskCustomers);
            } catch (Exception e) {
                log.warn("Gemini API call failed, falling back to deterministic heuristic diagnostic: {}", e.getMessage());
            }
        }

        // Deterministic Heuristic AI Financial Engine (Production fallback, zero mock)
        log.info("Executing AI Financial Diagnostic with Autonomous Heuristic Engine");
        return runHeuristicDiagnostic(business, cashBalance, receivables, overdue, upcomingExpenses, past30DaysExpenses, highRiskCustomers);
    }

    private String resolveGeminiApiKey() {
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            return geminiApiKey.trim();
        }
        String envVar = System.getenv("GEMINI_API_KEY");
        if (envVar != null && !envVar.isBlank()) {
            return envVar.trim();
        }
        String sysProp = System.getProperty("GEMINI_API_KEY");
        if (sysProp != null && !sysProp.isBlank()) {
            return sysProp.trim();
        }
        List<Path> candidateEnvPaths = List.of(
                Path.of(".env"),
                Path.of("../.env"),
                Path.of("backend/.env"),
                Path.of("../../.env")
        );
        for (Path p : candidateEnvPaths) {
            if (Files.exists(p)) {
                try {
                    List<String> lines = Files.readAllLines(p);
                    for (String line : lines) {
                        String trimmed = line.trim();
                        if (trimmed.startsWith("GEMINI_API_KEY=") && !trimmed.startsWith("#")) {
                            String key = trimmed.substring("GEMINI_API_KEY=".length()).trim();
                            key = key.replace("\"", "").replace("'", "").trim();
                            if (!key.isEmpty()) {
                                return key;
                            }
                        }
                    }
                } catch (Exception ignored) {
                }
            }
        }
        return null;
    }

    private AiDiagnosticResponse callGeminiApi(Business business, String apiKey,
                                               BigDecimal cashBalance, BigDecimal receivables,
                                               BigDecimal overdue, BigDecimal upcomingExpenses,
                                               BigDecimal past30DaysExpenses, long highRiskCustomers) throws Exception {

        String prompt = String.format(
                "You are an elite CFO and financial intelligence advisor analyzing CashFlow-Guardian data for small business: '%s'. " +
                "Currency: %s. " +
                "Real Financial Snapshot: " +
                "- Current Cash in Hand & Banks: %s " +
                "- Total Accounts Receivable: %s " +
                "- Critically Overdue Receivables: %s " +
                "- Upcoming Accounts Payable: %s " +
                "- Past 30 Days Operating Burn: %s " +
                "- High Risk / Chronic Late Customers: %d. " +
                "Provide an actionable CFO diagnostic in valid JSON format matching this schema: " +
                "{\"healthScore\": integer 0-100, \"liquidityStatus\": \"EXCELLENT\"|\"STABLE\"|\"VULNERABLE\"|\"CRITICAL\", " +
                "\"executiveSummary\": \"string\", \"identifiedRisks\": [\"string\"], \"strategicRecommendations\": [\"string\"], " +
                "\"insights\": [{\"title\": \"string\", \"content\": \"string\", \"actionableAdvice\": \"string\", \"severity\": \"INFO\"|\"WARNING\"|\"CRITICAL\"}]}. " +
                "Return raw JSON only, no markdown codeblocks.",
                business.getName(), business.getCurrency(), cashBalance, receivables, overdue, upcomingExpenses, past30DaysExpenses, highRiskCustomers
        );

        String requestBody = objectMapper.writeValueAsString(new GeminiPayload(prompt));
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", geminiModel, apiKey);

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .timeout(Duration.ofSeconds(25))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            String textResponse = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            textResponse = textResponse.replace("```json", "").replace("```", "").trim();

            JsonNode parsed = objectMapper.readTree(textResponse);
            int healthScore = parsed.path("healthScore").asInt(75);
            String liquidityStatus = parsed.path("liquidityStatus").asText("STABLE");
            String executiveSummary = parsed.path("executiveSummary").asText();

            List<String> risks = new ArrayList<>();
            parsed.path("identifiedRisks").forEach(r -> risks.add(r.asText()));

            List<String> recs = new ArrayList<>();
            parsed.path("strategicRecommendations").forEach(r -> recs.add(r.asText()));

            List<AiInsightDto> savedInsights = new ArrayList<>();
            if (parsed.has("insights")) {
                for (JsonNode in : parsed.path("insights")) {
                    AiInsight entity = AiInsight.builder()
                            .business(business)
                            .insightType(InsightType.GENERAL_ADVISORY)
                            .title(in.path("title").asText())
                            .content(in.path("content").asText())
                            .actionableAdvice(in.path("actionableAdvice").asText())
                            .severity(in.path("severity").asText("INFO"))
                            .generatedAt(OffsetDateTime.now())
                            .build();
                    entity = aiInsightRepository.save(entity);
                    savedInsights.add(mapToDto(entity));
                }
            }

            BigDecimal dailyBurn = past30DaysExpenses.divide(new BigDecimal("30"), 2, RoundingMode.HALF_UP);
            BigDecimal runway = dailyBurn.compareTo(BigDecimal.ZERO) > 0
                    ? cashBalance.divide(dailyBurn, 0, RoundingMode.DOWN)
                    : new BigDecimal("365");

            return AiDiagnosticResponse.builder()
                    .financialHealthScore(healthScore)
                    .liquidityStatus(liquidityStatus)
                    .executiveSummary(executiveSummary)
                    .identifiedRisks(risks)
                    .strategicRecommendations(recs)
                    .calculatedRunwayDays(runway)
                    .generatedInsights(savedInsights)
                    .isAiGenerated(true)
                    .build();
        } else {
            throw new RuntimeException("Gemini HTTP error: " + response.statusCode());
        }
    }

    private AiDiagnosticResponse runHeuristicDiagnostic(Business business,
                                                       BigDecimal cashBalance, BigDecimal receivables,
                                                       BigDecimal overdue, BigDecimal upcomingExpenses,
                                                       BigDecimal past30DaysExpenses, long highRiskCustomers) {
        int score = 85;
        List<String> risks = new ArrayList<>();
        List<String> recs = new ArrayList<>();
        List<AiInsightDto> newInsights = new ArrayList<>();

        BigDecimal netUpcoming = cashBalance.add(receivables).subtract(upcomingExpenses);

        if (netUpcoming.compareTo(BigDecimal.ZERO) < 0) {
            score -= 30;
            risks.add(String.format("Upcoming obligations exceed cash reserves by %s %s.",
                    business.getCurrency(), upcomingExpenses.subtract(cashBalance).max(BigDecimal.ZERO)));
            recs.add("Prioritize urgent collection of pending invoices before executing non-critical expenditures.");
        }

        if (overdue.compareTo(BigDecimal.ZERO) > 0) {
            score -= 15;
            risks.add(String.format("%s %s in overdue receivables is currently delayed past contracted due dates.",
                    business.getCurrency(), overdue));
            recs.add("Issue formal notice of overdue payment and enforce Net-7 terms on chronic late payers.");
        }

        if (highRiskCustomers > 0) {
            score -= 10;
            risks.add(String.format("%d customers currently show elevated default risk based on payment history.", highRiskCustomers));
            recs.add("Switch high-risk accounts to 50% advance deposit or milestone-based disbursements.");
        }

        if (cashBalance.compareTo(new BigDecimal("10000")) < 0 && upcomingExpenses.compareTo(cashBalance) > 0) {
            score -= 15;
            risks.add("Cash reserves are dangerously thin relative to near-term accounts payable.");
            recs.add("Negotiate extended vendor settlement terms to prevent a cash-flow squeeze.");
        }

        score = Math.max(15, Math.min(100, score));

        String status = score >= 80 ? "EXCELLENT" : score >= 60 ? "STABLE" : score >= 40 ? "VULNERABLE" : "CRITICAL";

        String summary = String.format(
                "CashFlow-Guardian Diagnostic: Business '%s' operates with a health score of %d/100 (%s). Available liquid capital stands at %s %s with %s %s expected in receivables.",
                business.getName(), score, status, business.getCurrency(), cashBalance, business.getCurrency(), receivables
        );

        if (recs.isEmpty()) {
            recs.add("Maintain steady cash discipline and regularly record incoming invoice settlements.");
            recs.add("Keep a minimum 60-day operating cash buffer across liquid checking accounts.");
        }

        AiInsight primaryInsight = AiInsight.builder()
                .business(business)
                .insightType(overdue.compareTo(BigDecimal.ZERO) > 0 ? InsightType.LATE_PAYMENT_RISK : InsightType.LIQUIDITY_SURPLUS)
                .title(overdue.compareTo(BigDecimal.ZERO) > 0 ? "Receivables Bottleneck Detected" : "Operating Cash Position Stable")
                .content(summary)
                .actionableAdvice(recs.get(0))
                .severity(score < 50 ? "CRITICAL" : score < 70 ? "WARNING" : "INFO")
                .generatedAt(OffsetDateTime.now())
                .build();
        primaryInsight = aiInsightRepository.save(primaryInsight);
        newInsights.add(mapToDto(primaryInsight));

        BigDecimal dailyBurn = past30DaysExpenses.divide(new BigDecimal("30"), 2, RoundingMode.HALF_UP);
        BigDecimal runway = dailyBurn.compareTo(BigDecimal.ZERO) > 0
                ? cashBalance.divide(dailyBurn, 0, RoundingMode.DOWN)
                : new BigDecimal("365");

        return AiDiagnosticResponse.builder()
                .financialHealthScore(score)
                .liquidityStatus(status)
                .executiveSummary(summary)
                .identifiedRisks(risks)
                .strategicRecommendations(recs)
                .calculatedRunwayDays(runway)
                .generatedInsights(newInsights)
                .isAiGenerated(false)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AiInsightDto> getInsights(Long businessId) {
        return aiInsightRepository.findAllByBusinessIdOrderByGeneratedAtDesc(businessId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private AiInsightDto mapToDto(AiInsight entity) {
        return AiInsightDto.builder()
                .id(entity.getId())
                .insightType(entity.getInsightType())
                .title(entity.getTitle())
                .content(entity.getContent())
                .actionableAdvice(entity.getActionableAdvice())
                .severity(entity.getSeverity())
                .generatedAt(entity.getGeneratedAt())
                .build();
    }

    // Helper record for Gemini REST Payload
    private record GeminiPayload(List<Content> contents) {
        public GeminiPayload(String prompt) {
            this(List.of(new Content(List.of(new Part(prompt)))));
        }
    }
    private record Content(List<Part> parts) {}
    private record Part(String text) {}
}

