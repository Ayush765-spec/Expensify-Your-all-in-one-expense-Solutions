# Expensify - Master Your Money in INR

A smart expense tracking application with AI-powered receipt scanning (powered by Google Gemini), Bitcoin integrity monitoring, and comprehensive financial management tools designed for Indian Rupee (INR) transactions.

## Overview

Expensify helps you take control of your finances by tracking income, expenses, and savings in one place. The app displays all amounts in Indian Rupees and includes advanced features like Bitcoin portfolio tracking and network health monitoring. You can explore with pre-loaded sample data or create your own account to save personal financial records.

## Main Sections

The app has five main sections accessible from the left sidebar:

- **Overview** - Your main dashboard with financial summary
- **Transactions** - Complete ledger of all your income and expenses
- **Receipt Scanner** - AI-powered tool to extract data from receipt images
- **Bitcoin Integrity** - Monitor your BTC holdings and network health
- **Manage** - Account settings, preferences, and data exports

## Features

### Dashboard (Overview)

The dashboard gives you a complete picture of your finances at a glance. At the top, you will see four key metrics showing your Total Income, Total Spend, Net Cashflow, and Bitcoin Holdings. Each card shows comparisons to last month and other helpful context like savings rate and top spending category.

Below that, you will find an Income vs Expenses chart that displays your monthly cashflow trend in INR, helping you visualize how your income and spending change over time. Next to it is a Spending Breakdown donut chart showing your top expense categories like Shopping, Food, and Transport.

The Recent Transactions section shows your latest inflows and outflows in a table format with ID, Date, Category, Account, and Amount columns. Income appears in green and expenses in red. There is also a Bitcoin Integrity widget showing the current BTC price, on-chain activity percentage, exchange reserves, derivatives status, and macro sentiment indicators.

### Transactions

The Transactions page is your complete financial ledger showing all amounts in Indian Rupees. At the top, summary cards display Total Records, Total Income, and Total Expense counts.

The Filters section lets you search, refine, and analyse your transactions. You can search by ID, account, or category using the search box. Quick filter buttons let you view All transactions or filter by specific categories like Salary, Food, Shopping, Freelance, or Transport. A Reset button clears all filters.

The Transaction Ledger table shows each entry with its ID, Date, Category (shown as colored badges), Account (like Primary Savings, Credit Card, or Checking Account), Status (Cleared or Pending), and Amount in Rupees. Each row has a three-dot menu for additional actions. The "New transaction" button lets you add new entries.

### Receipt Scanner

The Receipt Scanner uses Google Gemini AI to automatically extract expense data from receipt images. On the left side is the Upload Receipt area where you select an image file. The scanner supports JPG, PNG, and WebP formats. After selecting a file, you see a preview of the receipt image and can click "Scan Receipt" to process it.

On the right side, the Extracted Data panel shows all the information the AI pulled from your receipt including Merchant name, Date, Time, Total Amount, Tax, Payment Method, Receipt Number, and Category. The Items section shows a breakdown with Item name, Quantity, Unit Price, and Total for each line item.

At the bottom, Export Options let you save the scanned data. You can click "Save to Transactions" to add it directly to your ledger, or export the data as JSON or CSV files for use in other applications.

### Bitcoin Integrity

This section provides real-time health metrics and INR-denominated valuations for your Bitcoin holdings.

The Bitcoin Integrity Overview shows your Current Value in Rupees, BTC amount, last updated time, Realised Gain percentage, and portfolio allocation percentage. A "Recommend hedge" button suggests protective actions, and the Latest hedge activity area shows recent hedge executions.

The Integrity Actions panel on the right offers options to strengthen your BTC position including Deploy Collar Hedge, Rebalance Allocation, and Short CME Futures buttons. The "View custody checklist" link provides security recommendations, with a reminder to review the integrity dashboard regularly to keep on-chain health above 80%.

The Price Strength chart shows the daily close price trend in Rupees over several months from April through October.

Below that are three monitoring sections. Network Integrity tracks hash rate, node health, liquidity, and volatility with progress bars and change indicators. Risk Signals monitors external risk factors including macro sentiment, derivatives, exchange reserves, and on-chain activity with percentage scores and recommendations like Maintain, Monitor, or Reduce. The Bitcoin Wallets section shows your custody footprint across holdings, listing active wallets with their name, type (Hardware or Lightning), and custody method. You can add new wallets here.

Additional actions include "Refresh integrity metrics", "Simulate rebalance", and "Download risk report".

### Manage

The Manage section contains all your account settings and preferences.

Account Preferences lets you control how Expensify manages your INR accounts. You can set your Default settlement account (like HDFC Bank Savings) and view your Current surplus amount with savings rate percentage.

Security Posture shows key protections including 2FA enforcement status (Active or not), Device approvals requirement, and last security review date. The "Launch security checklist" button helps you review your security settings.

Developer Actions provides testing tools. The "Seed Data for Current User" button adds sample accounts, categories, and transactions for development and testing purposes.

Notification Centre lets you fine-tune how Expensify keeps you informed. Toggle switches control Email alerts for large spends, SMS reminders for bill payments, Bitcoin integrity updates, and Weekly expense digest notifications.

Data and Exports lets you export INR statements or schedule compliance reports. Buttons include "Export monthly ledger", "Schedule GST-ready CSV", and "Connect to Tally". All exports are generated in Indian Rupees rounded to the nearest rupee.

The Account section (powered by Clerk) lets you manage your profile and security settings. Profile details show your name, email addresses (with Primary designation), and Connected accounts like Google. You can update your profile, add email addresses, and manage connected services.

## User Authentication

Expensify uses Clerk for secure authentication. You can sign up with email and password or connect your Google account for quick login. The authentication system supports two-factor authentication (2FA) for enhanced security, multiple email addresses per account, and device approval requirements.

## Transaction Categories

Income categories include Salary and Freelance payments. Expense categories include Food, Shopping, and Transport. Categories appear as colored badges in transaction lists for easy identification.

## Account Types

You can track transactions across multiple account types including Primary Savings, Credit Card, Checking Account, and HDFC Bank Savings. Each transaction is linked to a specific account for accurate record-keeping.

## Mock Data

The app includes sample data so you can explore all features immediately. Sample transactions include salary deposits, food expenses, shopping purchases, freelance income, and transport costs. The Bitcoin section shows demo wallet data with sample BTC holdings and network metrics. Use the "Seed Data for Current User" button in Manage to add fresh sample data to your account.

## Currency

All amounts throughout the app are displayed in Indian Rupees (INR) with the ₹ symbol. This includes the dashboard metrics, transaction ledger, receipt scanner results, Bitcoin valuations, and all exports.

## Data Export Options

Expensify offers multiple ways to export your financial data. From the Receipt Scanner, you can export individual receipts as JSON or CSV. From the Manage section, you can export your monthly ledger, schedule GST-ready CSV reports for tax compliance, or connect directly to Tally accounting software.

## Tips for Best Results

For receipt scanning, use clear images with good lighting and make sure all text on the receipt is visible. The AI works best with standard printed receipts rather than handwritten ones.

For accurate tracking, categorize transactions consistently and review your dashboard weekly to stay on top of your finances. Set up email alerts for large spends to catch unusual activity quickly.

For Bitcoin monitoring, check the integrity dashboard regularly and aim to keep on-chain health above 80%. Use the risk signals recommendations to guide your hedging decisions.

## Support

If you encounter issues, you can access help through the Manage section. For authentication problems, the system is secured by Clerk which provides account recovery options.

## Version

Current version: 1.0.0

Currency: Indian Rupees (INR)

AI Provider: Google Gemini (Receipt Scanner)

Authentication: Clerk
