// Mock data for FraudEx dashboard and reports

// KPI Data for Dashboard
export const kpiData = {
    totalSpend: {
        value: 2847532.45,
        change: 12.5,
        trend: 'up' as const,
    },
    documentsProcessed: {
        value: 1842,
        change: 8.3,
        trend: 'up' as const,
    },
    highRiskFlags: {
        value: 23,
        change: -15.2,
        trend: 'down' as const,
    },
    averageFraudScore: {
        value: 18.7,
        change: -3.1,
        trend: 'down' as const,
    },
};

// Monthly Spending vs Anomalies Data
export const monthlySpendingData = [
    { month: 'Jan', spending: 245000, anomalies: 3 },
    { month: 'Feb', spending: 312000, anomalies: 5 },
    { month: 'Mar', spending: 287000, anomalies: 2 },
    { month: 'Apr', spending: 356000, anomalies: 8 },
    { month: 'May', spending: 298000, anomalies: 4 },
    { month: 'Jun', spending: 421000, anomalies: 12 },
    { month: 'Jul', spending: 378000, anomalies: 6 },
    { month: 'Aug', spending: 334000, anomalies: 4 },
    { month: 'Sep', spending: 289000, anomalies: 3 },
    { month: 'Oct', spending: 412000, anomalies: 9 },
    { month: 'Nov', spending: 367000, anomalies: 5 },
    { month: 'Dec', spending: 445000, anomalies: 7 },
];

// Benford's Law Data
export const benfordData = [
    { digit: '1', expected: 30.1, actual: 24.5 },
    { digit: '2', expected: 17.6, actual: 22.3 },
    { digit: '3', expected: 12.5, actual: 14.8 },
    { digit: '4', expected: 9.7, actual: 8.2 },
    { digit: '5', expected: 7.9, actual: 9.1 },
    { digit: '6', expected: 6.7, actual: 5.9 },
    { digit: '7', expected: 5.8, actual: 6.4 },
    { digit: '8', expected: 5.1, actual: 4.2 },
    { digit: '9', expected: 4.6, actual: 4.6 },
];

// Flagged Transactions
export const flaggedTransactions = [
    {
        id: 'TXN-001',
        date: '2024-01-15',
        vendor: 'Office Supplies Co.',
        amount: 5000.0,
        reason: 'Round Number',
        severity: 'medium' as const,
    },
    {
        id: 'TXN-002',
        date: '2024-01-18',
        vendor: 'Tech Solutions Inc.',
        amount: 15750.0,
        reason: 'Duplicate',
        severity: 'high' as const,
    },
    {
        id: 'TXN-003',
        date: '2024-01-22',
        vendor: 'Consulting Partners LLC',
        amount: 10000.0,
        reason: 'Round Number',
        severity: 'medium' as const,
    },
    {
        id: 'TXN-004',
        date: '2024-01-25',
        vendor: 'Unknown Vendor #847',
        amount: 8432.55,
        reason: 'New Vendor',
        severity: 'low' as const,
    },
    {
        id: 'TXN-005',
        date: '2024-01-28',
        vendor: 'Tech Solutions Inc.',
        amount: 15750.0,
        reason: 'Duplicate',
        severity: 'high' as const,
    },
    {
        id: 'TXN-006',
        date: '2024-02-01',
        vendor: 'Premium Services Ltd.',
        amount: 25000.0,
        reason: 'Round Number',
        severity: 'medium' as const,
    },
    {
        id: 'TXN-007',
        date: '2024-02-05',
        vendor: 'Global Trading Corp.',
        amount: 47892.0,
        reason: 'Unusual Amount',
        severity: 'high' as const,
    },
    {
        id: 'TXN-008',
        date: '2024-02-08',
        vendor: 'Local Maintenance Co.',
        amount: 3500.0,
        reason: 'Round Number',
        severity: 'low' as const,
    },
];

// Document Reports
export const documentReports = [
    {
        id: 'DOC-2024-001',
        name: 'Q4_2023_Financial_Report.pdf',
        uploadDate: '2024-01-10',
        corruptionScore: 67,
        status: 'analyzed' as const,
        flagsCount: 12,
        totalTransactions: 847,
    },
    {
        id: 'DOC-2024-002',
        name: 'January_Invoices_Batch.csv',
        uploadDate: '2024-01-15',
        corruptionScore: 23,
        status: 'analyzed' as const,
        flagsCount: 3,
        totalTransactions: 234,
    },
    {
        id: 'DOC-2024-003',
        name: 'Vendor_Payments_2024.pdf',
        uploadDate: '2024-01-20',
        corruptionScore: 89,
        status: 'analyzed' as const,
        flagsCount: 28,
        totalTransactions: 156,
    },
    {
        id: 'DOC-2024-004',
        name: 'Employee_Expenses_Jan.csv',
        uploadDate: '2024-01-25',
        corruptionScore: 12,
        status: 'analyzed' as const,
        flagsCount: 1,
        totalTransactions: 89,
    },
];

// Single Report Detail (for /report/[id] page)
export const getReportById = (id: string) => {
    const report = documentReports.find((r) => r.id === id);
    if (!report) {
        return {
            id: 'DOC-2024-001',
            name: 'Q4_2023_Financial_Report.pdf',
            uploadDate: '2024-01-10',
            corruptionScore: 67,
            status: 'analyzed' as const,
            flagsCount: 12,
            totalTransactions: 847,
            benfordData,
            flaggedTransactions,
            summary: {
                totalAmount: 2847532.45,
                avgTransaction: 3362.12,
                dateRange: 'Oct 1, 2023 - Dec 31, 2023',
                vendorCount: 127,
            },
        };
    }
    return {
        ...report,
        benfordData,
        flaggedTransactions,
        summary: {
            totalAmount: 2847532.45,
            avgTransaction: 3362.12,
            dateRange: 'Oct 1, 2023 - Dec 31, 2023',
            vendorCount: 127,
        },
    };
};

// Upload Progress Simulation
export const mockUploadFiles = [
    {
        id: 'upload-001',
        name: 'February_Expenses.pdf',
        size: 2.4,
        status: 'complete' as const,
        progress: 100,
    },
    {
        id: 'upload-002',
        name: 'Vendor_Contracts_Q1.csv',
        size: 1.8,
        status: 'analyzing' as const,
        progress: 75,
    },
    {
        id: 'upload-003',
        name: 'Bank_Statement_Jan.pdf',
        size: 4.2,
        status: 'ocr' as const,
        progress: 45,
    },
    {
        id: 'upload-004',
        name: 'Invoice_Batch_2024.pdf',
        size: 8.1,
        status: 'uploading' as const,
        progress: 20,
    },
];

// Recent Activity
export const recentActivity = [
    {
        id: 1,
        action: 'Document Analyzed',
        document: 'Q4_2023_Financial_Report.pdf',
        time: '2 hours ago',
        result: 'High Risk',
    },
    {
        id: 2,
        action: 'New Upload',
        document: 'January_Invoices_Batch.csv',
        time: '5 hours ago',
        result: 'Low Risk',
    },
    {
        id: 3,
        action: 'Flag Resolved',
        document: 'Vendor_Payments_2024.pdf',
        time: '1 day ago',
        result: 'Resolved',
    },
    {
        id: 4,
        action: 'Document Analyzed',
        document: 'Employee_Expenses_Jan.csv',
        time: '2 days ago',
        result: 'Low Risk',
    },
];
