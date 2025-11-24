const fs = require("fs");
const fontkit = require("@pdf-lib/fontkit");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

(async () => {
  // 1) Create A4 PDF
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // 2) Embed Poppins-Regular.ttf
  const poppinsBytes = fs.readFileSync("./Poppins/Poppins-Regular.ttf");
  const poppinsFont = await pdfDoc.embedFont(poppinsBytes);

  const form = pdfDoc.getForm();

  // Embed the logo
  const logoBytes = fs.readFileSync("wisestellalogo.png");
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoWidth = 50;
  const logoHeight = logoWidth * (logoImage.height / logoImage.width);

  // Layout constants
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginL = 50;
  const marginR = 50;
  const topY = pageHeight - 70;
  const footerY = 30;
  const compHeight = 20;
  const itemHeight = 20;
  const commentBoxHeight = 30;
  const radioDiam = 12;
  const labelFontSize = 5.5;
  const marginAfter = 10;
  const radioOptions = [
    "Unsatisfactory",
    "Needs improvement",
    "Meets Expectations",
    "Exceeds Expectations",
    "Exceptional",
  ];

  // Competency data
  const competencies = [
    {
      letter: "A",
      title: "Team Working",
      items: [
        { id: "A1", name: "Participation" },
        { id: "A2", name: "Inclusiveness and consideration of others" },
        { id: "A3", name: "Supporting Others" },
        { id: "A4", name: "Conflict resolution" },
      ],
    },
    {
      letter: "B",
      title: "Communication and Influencing",
      items: [
        { id: "B1", name: "Shared understanding" },
        { id: "B2", name: "Style of communication" },
        { id: "B3", name: "Feedback" },
      ],
    },
    {
      letter: "C",
      title: "Situation Awareness",
      items: [
        { id: "C1", name: "Awareness of vessel systems and crew" },
        { id: "C2", name: "Awareness of external environment" },
        { id: "C3", name: "Awareness of time" },
      ],
    },
    {
      letter: "D",
      title: "Decision Making",
      items: [
        { id: "D1", name: "Problem definition and diagnosis" },
        { id: "D2", name: "Option generation" },
        { id: "D3", name: "Risk assessment and option selection" },
        { id: "D4", name: "Outcome review" },
      ],
    },
    {
      letter: "E",
      title: "Results Focus",
      items: [
        { id: "E1", name: "Initiative" },
        { id: "E2", name: "Determination" },
        { id: "E3", name: "Flexibility" },
        { id: "E4", name: "Emotional toughness" },
        { id: "E5", name: "Accountability and dependability" },
      ],
    },
    {
      letter: "F",
      title: "Leadership and Managerial Skills",
      items: [
        { id: "F1", name: "Setting direction" },
        { id: "F2", name: "Empowerment" },
        { id: "F3", name: "Authority and assertiveness" },
        { id: "F4", name: "Providing and maintaining standards" },
        { id: "F5", name: "Planning and coordination" },
        { id: "F6", name: "Workload management" },
      ],
    },
  ];

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = topY;
  let isFirstPage = true;

  // Helper function to add a new page if needed
  function addNewPage() {
    currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    currentY = topY;
    addFooter();
    isFirstPage = false;
  }

  // Helper function to add header
  function addHeader() {
    currentPage.drawText("Assessment Details for", {
      x: marginL,
      y: currentY,
      size: 22,
      font: poppinsFont,
      color: rgb(0, 0, 0.7),
    });
    currentPage.drawLine({
      start: { x: marginL, y: currentY - 10 },
      end: { x: pageWidth - marginR, y: currentY - 10 },
      thickness: 2,
      color: rgb(0, 0, 0),
    });

    // Keep "Competency" title only (no textbox)
    if (isFirstPage) {
      currentPage.drawText("Competency", {
        x: marginL,
        y: currentY - 40,
        size: 14,
        font: poppinsFont,
        color: rgb(0, 0, 0),
      });
    }

    currentY -= 70;
  }

  // Helper function to add footer
  function addFooter() {
    currentPage.drawLine({
      start: { x: marginL, y: footerY + 12 },
      end: { x: pageWidth - marginR, y: footerY + 12 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    currentPage.drawImage(logoImage, {
      x: marginL,
      y: footerY,
      width: logoWidth,
      height: logoHeight,
    });
    currentPage.drawText("Copyright WiseStella 2024", {
      x: pageWidth - marginR - 100,
      y: footerY,
      size: 10,
      font: poppinsFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // Add header and footer to first page
  addHeader();
  addFooter();

  // Process each competency
  for (const comp of competencies) {
    const estimatedHeight =
      compHeight +
      comp.items.length * (itemHeight + commentBoxHeight + marginAfter);
    if (currentY - estimatedHeight < footerY + marginAfter) {
      addNewPage();
    }

    const boxTopY = currentY;
    currentPage.drawText(`${comp.letter}. ${comp.title}`, {
      x: marginL + 5,
      y: currentY - 5,
      size: 14,
      font: poppinsFont,
      color: rgb(0, 0, 1),
    });
    currentY -= 5;

    for (const item of comp.items) {
      currentPage.drawText(`${item.id}. ${item.name}`, {
        x: marginL + 5,
        y: currentY - 15,
        size: 6.5,
        font: poppinsFont,
        color: rgb(0, 0, 0),
      });
      const radioGroup = form.createRadioGroup(`rating_${item.id}`);
      const availW = pageWidth - marginL - marginR - 100;
      const spacing = (availW / (radioOptions.length - 1)) * 0.7;
      const yRadio = currentY - 15;

      radioOptions.forEach((label, i) => {
        const x = marginL + 150 + i * spacing;
        radioGroup.addOptionToPage(label, currentPage, {
          x,
          y: yRadio,
          width: radioDiam,
          height: radioDiam,
        });
        currentPage.drawText(label, {
          x: x + radioDiam + 2,
          y: yRadio - 2,
          size: labelFontSize,
          font: poppinsFont,
          color: rgb(0, 0, 0),
        });
      });
      currentY -= itemHeight;

      const commentField = form.createTextField(`comment_${item.id}`);
      commentField.addToPage(currentPage, {
        x: marginL + 5,
        y: currentY - commentBoxHeight - 5,
        width: pageWidth - marginL - marginR - 10,
        height: commentBoxHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      currentY -= commentBoxHeight;

      currentPage.drawLine({
        start: { x: marginL, y: currentY },
        end: { x: pageWidth - marginR, y: currentY },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      currentY -= marginAfter;
    }

    const totalHeight = boxTopY - currentY + compHeight;
    currentPage.drawRectangle({
      x: marginL,
      y: currentY,
      width: pageWidth - marginL - marginR,
      height: totalHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    currentPage.drawLine({
      start: { x: marginL, y: currentY },
      end: { x: pageWidth - marginR, y: currentY },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    currentY -= marginAfter;
  }

  // Save to disk
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync("output.pdf", pdfBytes);
  console.log("✓ output.pdf written");
})();
