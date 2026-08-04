import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePdf = ({
    companyName = "QwikCart",
    reportName = "Report",
    fileName = "Report.pdf",
    headers = [],
    rows = [],
    orientation = "landscape",
    theme = "striped",
    headColor = [37, 99, 235],
    margin = 14,
    showPageNumber = true,
    showDate = true,
}) => {

    const doc = new jsPDF({
        orientation,
        unit: "mm",
        format: "a4"
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // ==========================
    // Company Name
    // ==========================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(companyName, margin, 18);

    // ==========================
    // Report Name
    // ==========================

    doc.setFontSize(16);
    doc.text(reportName, margin, 28);

    // ==========================
    // Date
    // ==========================

    if (showDate) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        doc.text(
            `Generated On : ${new Date().toLocaleDateString()}`,
            margin,
            38
        );
    }

    // ==========================
    // Total Rows
    // ==========================

    doc.setFontSize(11);

    doc.text(
        `Total Records : ${rows.length}`,
        pageWidth - margin,
        38,
        { align: "right" }
    );

    // ==========================
    // Auto Table
    // ==========================

    autoTable(doc, {

        startY: 45,

        margin: {
            left: margin,
            right: margin
        },

        head: [headers],

        body: rows,

        theme,

        headStyles: {
            fillColor: headColor,
            textColor: 255,
            fontStyle: "bold",
            halign: "center",
            valign: "middle"
        },

        bodyStyles: {
            fontSize: 10,
            valign: "middle",
            textColor: [50, 50, 50]
        },

        styles: {
            cellPadding: 4,
            overflow: "linebreak",
            lineColor: [220, 220, 220],
            lineWidth: 0.1
        },

        alternateRowStyles: {
            fillColor: [248, 250, 252]
        },

        didDrawPage: function () {

            if (!showPageNumber) return;

            doc.setFontSize(10);

            doc.setTextColor(120);

            doc.text(
                `Page ${doc.getCurrentPageInfo().pageNumber}`,
                pageWidth - margin,
                pageHeight - 10,
                {
                    align: "right"
                }
            );
        }

    });

    doc.save(fileName);

};