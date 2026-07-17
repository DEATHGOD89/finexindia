package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/rs/cors"

	"backend/internal/api/handlers"
	"backend/internal/api/middleware"
	"backend/config"
)

func main() {
	cfg := config.Load()

	r := mux.NewRouter()

	api := r.PathPrefix("/api/v1").Subrouter()

	api.Use(middleware.RateLimit)
	api.Use(middleware.CORS)

	loanHandler := handlers.NewLoanHandler()
	investmentHandler := handlers.NewInvestmentHandler()
	taxHandler := handlers.NewTaxHandler()

	api.HandleFunc("/loan/emi", loanHandler.CalculateEMI).Methods("POST")
	api.HandleFunc("/loan/compare", loanHandler.Compare).Methods("POST")
	api.HandleFunc("/loan/amortization", loanHandler.Amortization).Methods("POST")

	api.HandleFunc("/investment/sip", investmentHandler.CalculateSIP).Methods("POST")
	api.HandleFunc("/investment/fd", investmentHandler.CalculateFD).Methods("POST")
	api.HandleFunc("/investment/rd", investmentHandler.CalculateRD).Methods("POST")
	api.HandleFunc("/investment/ppf", investmentHandler.CalculatePPF).Methods("POST")
	api.HandleFunc("/investment/nps", investmentHandler.CalculateNPS).Methods("POST")

	api.HandleFunc("/tax/calculate", taxHandler.Calculate).Methods("POST")
	api.HandleFunc("/tax/regimes", taxHandler.GetRegimes).Methods("GET")

	allowedOrigins := os.Getenv("CORS_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:3000"
	}

	c := cors.New(cors.Options{
		AllowedOrigins:   strings.Split(allowedOrigins, ","),
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
