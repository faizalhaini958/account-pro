body {
    font-family: 'Helvetica', 'Arial', sans-serif;
    color: #333;
    font-size: 12px;
    line-height: 1.5;
    margin: 0;
    padding: 0;
}

.container {
    width: 100%;
    margin: 0 auto;
    padding: 20px;
}

/* Header Styles */
.report-header {
    width: 100%;
    margin-bottom: 30px;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 15px;
}

.report-header .company-name {
    font-size: 18px;
    font-weight: bold;
    color: #1e293b;
    margin: 0;
}

.report-header .company-details {
    font-size: 10px;
    color: #64748b;
    margin-top: 5px;
}

.report-header .report-title {
    font-size: 16px;
    font-weight: bold;
    color: #2563eb;
    margin-top: 10px;
    text-transform: uppercase;
}

.report-header .report-period {
    font-size: 11px;
    color: #475569;
    margin-top: 5px;
}

/* Content Styles */
.content {
    margin-bottom: 40px;
}

/* Table Styles */
table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

th {
    background-color: #f1f5f9;
    color: #475569;
    font-weight: bold;
    text-align: left;
    padding: 10px 8px;
    border-bottom: 2px solid #e2e8f0;
    font-size: 10px;
    text-transform: uppercase;
}

td {
    padding: 8px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 11px;
}

tr:nth-child(even) {
    background-color: #f8fafc;
}

.text-right {
    text-align: right;
}

.text-center {
    text-align: center;
}

.text-bold {
    font-weight: bold;
}

/* Total Row Styles */
.total-row td {
    font-weight: bold;
    border-top: 2px solid #334155;
    border-bottom: none;
    padding-top: 12px;
    background-color: #f1f5f9;
}

.subtotal-row td {
    font-weight: 600;
    background-color: #f8fafc;
}

.grand-total-row td {
    font-weight: bold;
    font-size: 13px;
    background-color: #e2e8f0;
    border-top: 2px solid #334155;
}

/* Section Headers */
.section-header {
    background-color: #2563eb;
    color: white;
    padding: 8px 10px;
    font-weight: bold;
    font-size: 12px;
    margin-top: 20px;
    margin-bottom: 10px;
}

.subsection-header {
    background-color: #e2e8f0;
    color: #334155;
    padding: 6px 10px;
    font-weight: bold;
    font-size: 11px;
    margin-top: 15px;
    margin-bottom: 8px;
}

/* Amount Formatting */
.amount {
    font-family: 'Courier New', monospace;
    text-align: right;
}

.amount-positive {
    color: #16a34a;
}

.amount-negative {
    color: #dc2626;
}

/* Footer Styles */
.report-footer {
    margin-top: 40px;
    padding-top: 15px;
    border-top: 1px solid #e2e8f0;
    font-size: 9px;
    color: #94a3b8;
    text-align: center;
}

.report-footer .page-number {
    margin-top: 5px;
}

/* Aging Report Specific */
.aging-category {
    margin-bottom: 20px;
}

.aging-category-header {
    background-color: #f1f5f9;
    padding: 8px 10px;
    font-weight: bold;
    border-left: 4px solid #2563eb;
}

.aging-summary {
    margin-top: 30px;
}

.aging-summary-table {
    width: 50%;
    margin: 0 auto;
}

/* Balance Sheet Specific */
.balance-section {
    margin-bottom: 30px;
}

/* Print Specific */
@media print {
    body {
        margin: 0;
        padding: 0;
    }

    .page-break {
        page-break-before: always;
    }

    .no-break {
        page-break-inside: avoid;
    }
}

/* Page Break Control */
.page-break {
    page-break-before: always;
}

.no-break {
    page-break-inside: avoid;
}
