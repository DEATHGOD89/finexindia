package service

import "math"

type InvestmentService struct{}

func NewInvestmentService() *InvestmentService {
	return &InvestmentService{}
}

type SIPResult struct {
	TotalInvestment  float64
	EstimatedReturns float64
	MaturityValue    float64
	Timeline         []YearlyPoint
}

type YearlyPoint struct {
	Year       int
	Investment float64
	Value      float64
}

func (s *InvestmentService) CalculateSIP(monthlyAmount, rate, stepup float64, years int) *SIPResult {
	monthlyRate := rate / 12 / 100
	months := years * 12
	var totalInvestment, maturityValue float64
	var timeline []YearlyPoint

	currentAmount := monthlyAmount

	for month := 1; month <= months; month++ {
		if month > 1 && month%12 == 1 {
			currentAmount *= (1 + stepup/100)
		}

		totalInvestment += currentAmount
		maturityValue = (maturityValue + currentAmount) * (1 + monthlyRate)

		if month%12 == 0 {
			timeline = append(timeline, YearlyPoint{
				Year:       month / 12,
				Investment: math.Round(totalInvestment),
				Value:      math.Round(maturityValue),
			})
		}
	}

	return &SIPResult{
		TotalInvestment:  math.Round(totalInvestment),
		EstimatedReturns: math.Round(maturityValue - totalInvestment),
		MaturityValue:    math.Round(maturityValue),
		Timeline:         timeline,
	}
}

func (s *InvestmentService) CalculateFD(principal, rate, tenure float64, compounding string) map[string]float64 {
	compoundingFreq := map[string]float64{
		"yearly": 1, "half_yearly": 2, "quarterly": 4, "monthly": 12,
	}

	n := compoundingFreq[compounding]
	if n == 0 {
		n = 4
	}

	maturityValue := principal * math.Pow(1+(rate/100/n), n*tenure)
	interestEarned := maturityValue - principal
	effectiveYield := (math.Pow(1+(rate/100/n), n) - 1) * 100

	return map[string]float64{
		"maturity_value":   math.Round(maturityValue*100) / 100,
		"interest_earned":  math.Round(interestEarned*100) / 100,
		"effective_yield":  math.Round(effectiveYield*100) / 100,
	}
}

func (s *InvestmentService) CalculateRD(monthlyAmount, rate float64, tenure int) map[string]float64 {
	monthlyRate := rate / 12 / 100
	var maturityValue float64
	totalInvestment := monthlyAmount * float64(tenure)

	for i := 1; i <= tenure; i++ {
		maturityValue += monthlyAmount * math.Pow(1+monthlyRate, float64(tenure-i+1))
	}

	interestEarned := maturityValue - totalInvestment

	return map[string]float64{
		"maturity_value":    math.Round(maturityValue*100) / 100,
		"total_investment":  math.Round(totalInvestment*100) / 100,
		"interest_earned":   math.Round(interestEarned*100) / 100,
	}
}

func (s *InvestmentService) CalculatePPF(annualAmount, rate float64, tenure int) map[string]interface{} {
	r := rate / 100
	var totalInvestment, maturityValue float64
	var timeline []YearlyPoint

	for year := 1; year <= tenure; year++ {
		totalInvestment += annualAmount
		maturityValue = (maturityValue + annualAmount) * (1 + r)

		timeline = append(timeline, YearlyPoint{
			Year:       year,
			Investment: math.Round(totalInvestment),
			Value:      math.Round(maturityValue),
		})
	}

	return map[string]interface{}{
		"total_investment": math.Round(totalInvestment),
		"interest_earned":  math.Round(maturityValue - totalInvestment),
		"maturity_value":   math.Round(maturityValue),
		"timeline":         timeline,
	}
}

func (s *InvestmentService) CalculateNPS(monthlyAmount, rate float64, tenure int, annuityRate, annuityReturn float64) map[string]float64 {
	monthlyRate := rate / 12 / 100
	months := tenure * 12
	var totalInvestment, corpusAtRetirement float64

	for month := 1; month <= months; month++ {
		totalInvestment += monthlyAmount
		corpusAtRetirement = (corpusAtRetirement + monthlyAmount) * (1 + monthlyRate)
	}

	lumpSum := corpusAtRetirement * (1 - annuityRate)
	annuityCorpus := corpusAtRetirement * annuityRate
	monthlyPension := annuityCorpus * (annuityReturn / 12 / 100)

	return map[string]float64{
		"total_investment":     math.Round(totalInvestment),
		"corpus_at_retirement": math.Round(corpusAtRetirement),
		"lump_sum":            math.Round(lumpSum),
		"annuity_corpus":      math.Round(annuityCorpus),
		"monthly_pension":     math.Round(monthlyPension*100) / 100,
	}
}
