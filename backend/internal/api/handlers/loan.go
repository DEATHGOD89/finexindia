package handlers

import (
	"encoding/json"
	"math"
	"net/http"
)

type LoanHandler struct{}

func NewLoanHandler() *LoanHandler {
	return &LoanHandler{}
}

type EMIRequest struct {
	Principal float64 `json:"principal"`
	Rate      float64 `json:"rate"`
	Tenure    int     `json:"tenure"`
}

type EMIResponse struct {
	EMI           float64 `json:"emi"`
	TotalInterest float64 `json:"total_interest"`
	TotalPayment  float64 `json:"total_payment"`
}

type CompareRequest struct {
	Amount float64 `json:"amount"`
	Tenure int     `json:"tenure"`
}

type BankOffer struct {
	Bank          string  `json:"bank"`
	Rate          float64 `json:"rate"`
	ProcessingFee float64 `json:"processing_fee"`
	EMI           float64 `json:"emi"`
	TotalInterest float64 `json:"total_interest"`
	Score         float64 `json:"score"`
}

func (h *LoanHandler) CalculateEMI(w http.ResponseWriter, r *http.Request) {
	var req EMIRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	monthlyRate := req.Rate / 12 / 100
	months := req.Tenure * 12

	emi := req.Principal * monthlyRate * math.Pow(1+monthlyRate, float64(months)) /
		(math.Pow(1+monthlyRate, float64(months)) - 1)

	totalPayment := emi * float64(months)
	totalInterest := totalPayment - req.Principal

	resp := EMIResponse{
		EMI:           math.Round(emi*100) / 100,
		TotalInterest: math.Round(totalInterest*100) / 100,
		TotalPayment:  math.Round(totalPayment*100) / 100,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *LoanHandler) Compare(w http.ResponseWriter, r *http.Request) {
	var req CompareRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	banks := []BankOffer{
		{Bank: "SBI", Rate: 8.50, ProcessingFee: 0.50},
		{Bank: "HDFC", Rate: 8.75, ProcessingFee: 0.25},
		{Bank: "ICICI", Rate: 8.65, ProcessingFee: 0.35},
		{Bank: "Axis Bank", Rate: 8.90, ProcessingFee: 0.30},
		{Bank: "Kotak Mahindra", Rate: 8.80, ProcessingFee: 0.40},
	}

	var results []BankOffer
	for _, bank := range banks {
		emi := calculateEMI(req.Amount, bank.Rate, req.Tenure)
		totalPayment := emi * float64(req.Tenure*12)
		totalInterest := totalPayment - req.Amount

		results = append(results, BankOffer{
			Bank:          bank.Bank,
			Rate:          bank.Rate,
			ProcessingFee: bank.ProcessingFee,
			EMI:           math.Round(emi*100) / 100,
			TotalInterest: math.Round(totalInterest*100) / 100,
			Score:         emi*0.4 + totalInterest*0.4 + bank.ProcessingFee*0.2,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func (h *LoanHandler) Amortization(w http.ResponseWriter, r *http.Request) {
	var req EMIRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	monthlyRate := req.Rate / 12 / 100
	months := req.Tenure * 12
	emi := calculateEMI(req.Principal, req.Rate, req.Tenure)

	type ScheduleEntry struct {
		Month     int     `json:"month"`
		EMI       float64 `json:"emi"`
		Principal float64 `json:"principal"`
		Interest  float64 `json:"interest"`
		Balance   float64 `json:"balance"`
	}

	schedule := []ScheduleEntry{}
	balance := req.Principal

	for month := 1; month <= months; month++ {
		interest := balance * monthlyRate
		principalPaid := emi - interest

		if principalPaid > balance {
			principalPaid = balance
		}

		balance -= principalPaid

		schedule = append(schedule, ScheduleEntry{
			Month:     month,
			EMI:       math.Round(emi*100) / 100,
			Principal: math.Round(principalPaid*100) / 100,
			Interest:  math.Round(interest*100) / 100,
			Balance:   math.Round(math.Max(0, balance)*100) / 100,
		})

		if balance <= 0 {
			break
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(schedule)
}

func calculateEMI(principal, rate float64, tenure int) float64 {
	monthlyRate := rate / 12 / 100
	months := tenure * 12
	return principal * monthlyRate * math.Pow(1+monthlyRate, float64(months)) /
		(math.Pow(1+monthlyRate, float64(months)) - 1)
}
