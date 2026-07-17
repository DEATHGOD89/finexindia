package service

import "math"

type LoanService struct{}

func NewLoanService() *LoanService {
	return &LoanService{}
}

type EMIResult struct {
	EMI           float64
	TotalInterest float64
	TotalPayment  float64
}

type ScheduleEntry struct {
	Month     int
	EMI       float64
	Principal float64
	Interest  float64
	Balance   float64
}

func (s *LoanService) CalculateEMI(principal, rate float64, tenure int) *EMIResult {
	monthlyRate := rate / 12 / 100
	months := tenure * 12

	emi := principal * monthlyRate * math.Pow(1+monthlyRate, float64(months)) /
		(math.Pow(1+monthlyRate, float64(months)) - 1)

	totalPayment := emi * float64(months)
	totalInterest := totalPayment - principal

	return &EMIResult{
		EMI:           math.Round(emi*100) / 100,
		TotalInterest: math.Round(totalInterest*100) / 100,
		TotalPayment:  math.Round(totalPayment*100) / 100,
	}
}

func (s *LoanService) GenerateAmortizationSchedule(principal, rate float64, tenure int) []ScheduleEntry {
	monthlyRate := rate / 12 / 100
	months := tenure * 12
	emi := principal * monthlyRate * math.Pow(1+monthlyRate, float64(months)) /
		(math.Pow(1+monthlyRate, float64(months)) - 1)

	var schedule []ScheduleEntry
	balance := principal

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

	return schedule
}

func (s *LoanService) CompareLoans(amount float64, tenure int) []map[string]interface{} {
	banks := []struct {
		Name          string
		Rate          float64
		ProcessingFee float64
	}{
		{"SBI", 8.50, 0.50},
		{"HDFC", 8.75, 0.25},
		{"ICICI", 8.65, 0.35},
		{"Axis Bank", 8.90, 0.30},
		{"Kotak Mahindra", 8.80, 0.40},
	}

	var results []map[string]interface{}

	for _, bank := range banks {
		result := s.CalculateEMI(amount, bank.Rate, tenure)

		results = append(results, map[string]interface{}{
			"bank":           bank.Name,
			"rate":           bank.Rate,
			"processing_fee": bank.ProcessingFee,
			"emi":            result.EMI,
			"total_interest": result.TotalInterest,
			"total_payment":  result.TotalPayment,
			"score":          result.EMI*0.4 + result.TotalInterest*0.4 + bank.ProcessingFee*0.2,
		})
	}

	return results
}
