package handlers

import (
	"encoding/json"
	"math"
	"net/http"
)

type InvestmentHandler struct{}

func NewInvestmentHandler() *InvestmentHandler {
	return &InvestmentHandler{}
}

type SIPRequest struct {
	MonthlyAmount float64 `json:"monthly_amount"`
	Rate          float64 `json:"rate"`
	Years         int     `json:"years"`
	Stepup        float64 `json:"stepup"`
}

type SIPResponse struct {
	TotalInvestment float64       `json:"total_investment"`
	EstimatedReturns float64      `json:"estimated_returns"`
	MaturityValue   float64       `json:"maturity_value"`
	Timeline        []YearlyPoint `json:"timeline"`
}

type YearlyPoint struct {
	Year       int     `json:"year"`
	Investment float64 `json:"investment"`
	Value      float64 `json:"value"`
}

type FDRequest struct {
	Principal    float64 `json:"principal"`
	Rate         float64 `json:"rate"`
	Tenure       float64 `json:"tenure"`
	Compounding  string  `json:"compounding"`
}

type FDResponse struct {
	MaturityValue  float64 `json:"maturity_value"`
	InterestEarned float64 `json:"interest_earned"`
	EffectiveYield float64 `json:"effective_yield"`
}

func (h *InvestmentHandler) CalculateSIP(w http.ResponseWriter, r *http.Request) {
	var req SIPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	monthlyRate := req.Rate / 12 / 100
	months := req.Years * 12
	var totalInvestment, maturityValue float64
	var timeline []YearlyPoint

	currentMonthlyAmount := req.MonthlyAmount

	for month := 1; month <= months; month++ {
		if month > 1 && month%12 == 1 {
			currentMonthlyAmount *= (1 + req.Stepup/100)
		}

		totalInvestment += currentMonthlyAmount
		maturityValue = (maturityValue + currentMonthlyAmount) * (1 + monthlyRate)

		if month%12 == 0 {
			timeline = append(timeline, YearlyPoint{
				Year:       month / 12,
				Investment: math.Round(totalInvestment),
				Value:      math.Round(maturityValue),
			})
		}
	}

	resp := SIPResponse{
		TotalInvestment:  math.Round(totalInvestment),
		EstimatedReturns: math.Round(maturityValue - totalInvestment),
		MaturityValue:    math.Round(maturityValue),
		Timeline:         timeline,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *InvestmentHandler) CalculateFD(w http.ResponseWriter, r *http.Request) {
	var req FDRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	compoundingFreq := map[string]float64{
		"yearly":      1,
		"half_yearly": 2,
		"quarterly":   4,
		"monthly":     12,
	}

	n := compoundingFreq[req.Compounding]
	if n == 0 {
		n = 4
	}

	maturityValue := req.Principal * math.Pow(1+(req.Rate/100/n), n*req.Tenure)
	interestEarned := maturityValue - req.Principal
	effectiveYield := (math.Pow(1+(req.Rate/100/n), n) - 1) * 100

	resp := FDResponse{
		MaturityValue:  math.Round(maturityValue*100) / 100,
		InterestEarned: math.Round(interestEarned*100) / 100,
		EffectiveYield: math.Round(effectiveYield*100) / 100,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *InvestmentHandler) CalculateRD(w http.ResponseWriter, r *http.Request) {
	var req struct {
		MonthlyAmount float64 `json:"monthly_amount"`
		Rate          float64 `json:"rate"`
		Tenure        int     `json:"tenure"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	monthlyRate := req.Rate / 12 / 100
	var maturityValue float64
	totalInvestment := req.MonthlyAmount * float64(req.Tenure)

	for i := 1; i <= req.Tenure; i++ {
		maturityValue += req.MonthlyAmount * math.Pow(1+monthlyRate, float64(req.Tenure-i+1))
	}

	interestEarned := maturityValue - totalInvestment

	resp := struct {
		MaturityValue  float64 `json:"maturity_value"`
		TotalInvestment float64 `json:"total_investment"`
		InterestEarned float64 `json:"interest_earned"`
	}{
		MaturityValue:   math.Round(maturityValue*100) / 100,
		TotalInvestment: math.Round(totalInvestment*100) / 100,
		InterestEarned:  math.Round(interestEarned*100) / 100,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *InvestmentHandler) CalculatePPF(w http.ResponseWriter, r *http.Request) {
	var req struct {
		AnnualAmount float64 `json:"annual_amount"`
		Rate         float64 `json:"rate"`
		Tenure       int     `json:"tenure"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	rate := req.Rate / 100
	var totalInvestment, maturityValue float64
	var timeline []YearlyPoint

	for year := 1; year <= req.Tenure; year++ {
		totalInvestment += req.AnnualAmount
		maturityValue = (maturityValue + req.AnnualAmount) * (1 + rate)

		timeline = append(timeline, YearlyPoint{
			Year:       year,
			Investment: math.Round(totalInvestment),
			Value:      math.Round(maturityValue),
		})
	}

	resp := struct {
		TotalInvestment float64       `json:"total_investment"`
		InterestEarned  float64       `json:"interest_earned"`
		MaturityValue   float64       `json:"maturity_value"`
		Timeline        []YearlyPoint `json:"timeline"`
	}{
		TotalInvestment: math.Round(totalInvestment),
		InterestEarned:  math.Round(maturityValue - totalInvestment),
		MaturityValue:   math.Round(maturityValue),
		Timeline:        timeline,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *InvestmentHandler) CalculateNPS(w http.ResponseWriter, r *http.Request) {
	var req struct {
		MonthlyAmount float64 `json:"monthly_amount"`
		Rate          float64 `json:"rate"`
		Tenure        int     `json:"tenure"`
		AnnuityRate   float64 `json:"annuity_rate"`
		AnnuityReturn float64 `json:"annuity_return"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.AnnuityRate == 0 {
		req.AnnuityRate = 0.4
	}
	if req.AnnuityReturn == 0 {
		req.AnnuityReturn = 6
	}

	monthlyRate := req.Rate / 12 / 100
	months := req.Tenure * 12
	var totalInvestment, corpusAtRetirement float64

	for month := 1; month <= months; month++ {
		totalInvestment += req.MonthlyAmount
		corpusAtRetirement = (corpusAtRetirement + req.MonthlyAmount) * (1 + monthlyRate)
	}

	lumpSum := corpusAtRetirement * (1 - req.AnnuityRate)
	annuityCorpus := corpusAtRetirement * req.AnnuityRate
	monthlyPension := annuityCorpus * (req.AnnuityReturn / 12 / 100)

	resp := struct {
		TotalInvestment   float64 `json:"total_investment"`
		CorpusAtRetirement float64 `json:"corpus_at_retirement"`
		LumpSum           float64 `json:"lump_sum"`
		AnnuityCorpus     float64 `json:"annuity_corpus"`
		MonthlyPension    float64 `json:"monthly_pension"`
	}{
		TotalInvestment:    math.Round(totalInvestment),
		CorpusAtRetirement: math.Round(corpusAtRetirement),
		LumpSum:           math.Round(lumpSum),
		AnnuityCorpus:     math.Round(annuityCorpus),
		MonthlyPension:    math.Round(monthlyPension*100) / 100,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
