import jsPDF from "jspdf";
import dayjs from "dayjs";

export default function printAttendanceRegister({
    workers,
    attendance,
    month,
    year,
    plantation,
    workerType,
    daysInMonth
}) {

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);

    doc.text(
        "NIRMALANI PLANTATION",
        148,
        15,
        { align: "center" }
    );

    doc.setFontSize(15);

    doc.text(
        "MONTHLY ATTENDANCE REGISTER",
        148,
        24,
        { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
        `Month : ${dayjs(`${year}-${month}-01`).format("MMMM YYYY")}`,
        10,
        34
    );

    doc.text(
        `Plantation : ${plantation}`,
        105,
        34,
        { align: "center" }
    );

    doc.text(
        `Worker Type : ${workerType}`,
        287,
        34,
        { align: "right" }
    );

    const startX = 10;
    const startY = 40;

    const rowHeight = 8;

    const epfWidth = 18;
    const nameWidth = 40;
    const dayWidth = 5;
    const totalWidth = 10;
    let x = startX;
    let currentY = startY;

    const drawTableHeader = () => {

        let x = startX;
        let y = currentY;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);

        // EPF
        doc.setFillColor(30, 41, 59);
        doc.setTextColor(255);
        doc.rect(x, y, epfWidth, rowHeight, "F");
        doc.text("EPF", x + epfWidth / 2, y + 5, { align: "center" });

        x += epfWidth;

        // Name
        doc.rect(x, y, nameWidth, rowHeight, "F");
        doc.text("Name", x + nameWidth / 2, y + 5, { align: "center" });

        x += nameWidth;

        // Days
        for (let day = 1; day <= daysInMonth; day++) {

            const currentDate = dayjs(
                `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            );

            const weekday = currentDate.day();

            if (weekday === 0)
                doc.setFillColor(180, 40, 40);      // Sunday
            else if (weekday === 6)
                doc.setFillColor(220, 120, 30);     // Saturday
            else
                doc.setFillColor(30, 41, 59);

            doc.rect(x, y, dayWidth, rowHeight, "F");

            doc.text(
                String(day),
                x + dayWidth / 2,
                y + 5,
                { align: "center" }
            );

            x += dayWidth;
        }

        doc.setFillColor(30, 41, 59);

        doc.rect(x, y, totalWidth, rowHeight, "F");

        doc.text(
            "Total",
            x + totalWidth / 2,
            y + 5,
            { align: "center" }
        );

        doc.setTextColor(0);

    };

    drawTableHeader();

    currentY += rowHeight;

    workers.forEach(worker => {

        if (currentY > 190) {

            doc.addPage();

            currentY = startY;

            drawTableHeader();

            currentY += rowHeight;
}

        let x = startX;

        let total = 0;

        // EPF
        doc.rect(x, currentY, epfWidth, rowHeight);

        doc.text(
            worker.epf_no || "-",
            x + 2,
            currentY + 5
        );

        x += epfWidth;

        // Name
        doc.rect(x, currentY, nameWidth, rowHeight);

        doc.text(
            worker.name,
            x + 2,
            currentY + 5
        );

        x += nameWidth;

        for (let day = 1; day <= daysInMonth; day++) {

            const date = dayjs(
                `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`
            ).format("YYYY-MM-DD");

            const key =
                `${worker.worker_type}-${worker.worker_id}-${date}`;

            doc.rect(
                x,
                currentY,
                dayWidth,
                rowHeight
            );

            if (attendance[key]) {

                total++;

                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);

                doc.text(
                    "/",
                    x + dayWidth / 2,
                    currentY + 5,
                    {
                        align: "center"
                    }
                );

                doc.setFont("helvetica", "normal");
                doc.setFontSize(7);

            }

            x += dayWidth;

        }

        doc.rect(
            x,
            currentY,
            totalWidth,
            rowHeight
        );

        doc.text(
            String(total),
            x + 5,
            currentY + 5
        );

        currentY += rowHeight;

    });

    currentY += 15;

    doc.text(
        "Prepared By : ____________________",
        20,
        currentY
    );

    doc.text(
        "Checked By : ____________________",
        105,
        currentY
    );

    doc.text(
        "Approved By : ____________________",
        200,
        currentY
    );
    doc.save(
        `Attendance Register ${month}-${year}.pdf`
    );

}