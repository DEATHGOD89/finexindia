package service

import "math"

type TaxService struct{}

func NewTaxService() *TaxService {
	return &TaxService{}
}

type Deductions struct {
	Section80C float64
	Section80D float64
	HRA        float64
	HomeLoan   float64
}

type TaxRegimeResult struct {
	TaxableIncome float64
	Tax           float64
	Deductions    float64
}

type TaxResult struct {
	OldRegime TaxRegimeResult
	NewRegime TaxRegimeResult
}

func (s *TaxService) Calculate(income float64, deductions Deductions) *TaxResult {
	return &TaxResult{
		OldRegime: s.calculateOldRegime(income, deductions),
		NewRegime: s.calculateNewRegime(income),
	}
}

func (s *TaxService) calculateOldRegime(income float64, deductions Deductions) TaxRegimeResult {
	totalDeductions := deductions.Section80C + deductions.Section80D + deductions.HRA + deductions.HomeLoan
	taxableIncome := math.Max(0, income-totalDeductions)

	tax := s.computeOldRegimeTax(taxableIncome)

	return TaxRegimeResult{
		TaxableIncome: math.Round(taxableIncome),
		Tax:           math.Round(tax),
		Deductions:    totalDeductions,
	}
}

func (s *TaxService) computeOldRegimeTax(income float64) float64 {
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

func (s *TaxService) calculateNewRegime(income float64) TaxRegimeResult {
	taxableIncome := income
	tax := s.computeNewRegimeTax(taxableIncome)

	return TaxRegimeResult{
		TaxableIncome: math.Round(taxableIncome),
		Tax:           math.Round(tax),
	}
}

func (s *TaxService) computeNewRegimeTax(income float64) float64 {
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
