package handlers

import (
	"encoding/json"
	"math"
	"net/http"
)

type TaxHandler struct{}

func NewTaxHandler() *TaxHandler {
	return &TaxHandler{}
}

type TaxRequest struct {
	Income     float64 `json:"income"`
	Section80C float64 `json:"section_80c"`
	Section80D float64 `json:"section_80d"`
	HRA        float64 `json:"hra"`
	HomeLoan   float64 `json:"home_loan"`
}

type TaxResponse struct {
	OldRegime TaxRegime `json:"old_regime"`
	NewRegime TaxRegime `json:"new_regime"`
}

type TaxRegime struct {
	TaxableIncome float64 `json:"taxable_income"`
	Tax           float64 `json:"tax"`
	Deductions    float64 `json:"deductions,omitempty"`
}

func (h *TaxHandler) Calculate(w http.ResponseWriter, r *http.Request) {
	var req TaxRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	resp := TaxResponse{
		OldRegime: calculateOldRegime(req),
		NewRegime: calculateNewRegime(req),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *TaxHandler) GetRegimes(w http.ResponseWriter, r *http.Request) {
	regimes := map[string]interface{}{
		"old_regime": map[string]interface{}{
			"name":  "Old Tax Regime",
			"slabs": []map[string]interface{}{
				{"limit": 250000, "rate": 0},
				{"limit": 500000, "rate": 5},
				{"limit": 1000000, "rate": 20},
				{"limit": -1, "rate": 30},
			},
			"standard_deduction": 50000,
			"section_80c_limit":  150000,
		},
		"new_regime": map[string]interface{}{
			"name":  "New Tax Regime",
			"slabs": []map[string]interface{}{
				{"limit": 300000, "rate": 0},
				{"limit": 600000, "rate": 5},
				{"limit": 900000, "rate": 10},
				{"limit": 1200000, "rate": 15},
				{"limit": 1500000, "rate": 20},
				{"limit": -1, "rate": 30},
			},
			"standard_deduction": 0,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(regimes)
}

func calculateOldRegime(req TaxRequest) TaxRegime {
	totalDeductions := req.Section80C + req.Section80D + req.HRA + req.HomeLoan
	taxableIncome := math.Max(0, req.Income-totalDeductions)
	tax := computeOldRegimeTax(taxableIncome)

	return TaxRegime{
		TaxableIncome: math.Round(taxableIncome),
		Tax:           math.Round(tax),
		Deductions:    totalDeductions,
	}
}

func computeOldRegimeTax(income float64) float64 {
	var tax float64
	remaining := income

	slabs := []struct {
		limit float64
		rate  float64
	}{
		{250000, 0},
		{500000, 0.05},
		{1000000, 0.20},
		{math.Inf(1), 0.30},
	}

	prevLimit := 0.0
	for _, slab := range slabs {
		amount := math.Min(remaining, slab.limit-float64(prevLimit))
		if amount > 0 {
			tax += amount * slab.rate
			remaining -= amount
		}
		prevLimit = slab.limit
		if remaining <= 0 {
			break
		}
	}

	tax *= 1.04

	if income <= 500000 {
		tax = math.Max(0, tax-12500)
	}

	return tax
}

func calculateNewRegime(req TaxRequest) TaxRegime {
	taxableIncome := req.Income
	tax := computeNewRegimeTax(taxableIncome)

	return TaxRegime{
		TaxableIncome: math.Round(taxableIncome),
		Tax:           math.Round(tax),
	}
}

func computeNewRegimeTax(income float64) float64 {
	var tax float64
	remaining := income

	slabs := []struct {
		limit float64
		rate  float64
	}{
		{300000, 0},
		{600000, 0.05},
		{900000, 0.10},
		{1200000, 0.15},
		{1500000, 0.20},
		{math.Inf(1), 0.30},
	}

	prevLimit := 0.0
	for _, slab := range slabs {
		amount := math.Min(remaining, slab.limit-float64(prevLimit))
		if amount > 0 {
			tax += amount * slab.rate
			remaining -= amount
		}
		prevLimit = slab.limit
		if remaining <= 0 {
			break
		}
	}

	tax *= 1.04

	if income <= 700000 {
		tax = 0
	}

	return tax
}
