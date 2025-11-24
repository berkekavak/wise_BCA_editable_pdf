const fs = require("fs");
const fontkit = require("@pdf-lib/fontkit");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

(async () => {
  // 1) Create A4 PDF
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // 2) Embed Poppins fonts
  const poppinsBytes = fs.readFileSync("./Poppins/Poppins-Regular.ttf");
  const poppinsFont = await pdfDoc.embedFont(poppinsBytes);

  const poppinsBoldBytes = fs.readFileSync("./Poppins/Poppins-SemiBold.ttf");
  const poppinsBoldFont = await pdfDoc.embedFont(poppinsBoldBytes);

  const form = pdfDoc.getForm();

  // Embed the logo
  const logoBytes = fs.readFileSync("wisestellalogo.png");
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoWidth = 50;
  const logoHeight = logoWidth * (logoImage.height / logoImage.width);

  // Modern color palette
  const colors = {
    primary: rgb(0.2, 0.4, 0.7),
    primaryLight: rgb(0.85, 0.9, 0.95),
    accent: rgb(0.3, 0.6, 0.9),
    success: rgb(0.2, 0.7, 0.4),
    warning: rgb(0.95, 0.7, 0.2),
    danger: rgb(0.9, 0.3, 0.3),
    text: rgb(0.15, 0.15, 0.15),
    textLight: rgb(0.4, 0.4, 0.4),
    border: rgb(0.85, 0.85, 0.85),
    background: rgb(0.98, 0.98, 0.98),
  };

  // Layout constants
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginL = 50;
  const marginR = 50;
  const topY = pageHeight - 80;
  const footerY = 35;
  const compHeight = 28;
  const itemHeight = 40;
  const radioLineHeight = 18;
  const commentBoxHeight = 45;
  const radioDiam = 10;
  const labelFontSize = 6;
  const marginAfter = 18;
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

  // Helper function to draw rounded rectangle (simulated with corners)
  function drawRoundedRect(
    x,
    y,
    width,
    height,
    radius,
    color,
    isFilled = true
  ) {
    if (isFilled) {
      // Main rectangle
      currentPage.drawRectangle({
        x: x + radius,
        y: y,
        width: width - 2 * radius,
        height: height,
        color: color,
      });
      currentPage.drawRectangle({
        x: x,
        y: y + radius,
        width: width,
        height: height - 2 * radius,
        color: color,
      });
      // Corner circles
      const cornerPositions = [
        [x + radius, y + radius],
        [x + width - radius, y + radius],
        [x + radius, y + height - radius],
        [x + width - radius, y + height - radius],
      ];
      cornerPositions.forEach(([cx, cy]) => {
        currentPage.drawCircle({
          x: cx,
          y: cy,
          size: radius,
          color: color,
        });
      });
    }
  }

  // Helper function to add a new page if needed
  function addNewPage() {
    currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    currentY = topY;
    addFooter();
    isFirstPage = false;
  }

  // Helper function to add header
  function addHeader() {
    // Modern header with background
    currentPage.drawRectangle({
      x: 0,
      y: currentY - 5,
      width: pageWidth,
      height: 50,
      color: colors.primaryLight,
    });

    currentPage.drawText("Assessment Details for", {
      x: marginL,
      y: currentY + 10,
      size: 24,
      font: poppinsFont,
      color: colors.primary,
    });

    // Accent line under title
    currentPage.drawRectangle({
      x: marginL,
      y: currentY - 8,
      width: 180,
      height: 3,
      color: colors.accent,
    });

    // Keep "Competency" title only (no textbox)
    if (isFirstPage) {
      currentPage.drawText("Competency", {
        x: marginL,
        y: currentY - 35,
        size: 16,
        font: poppinsFont,
        color: colors.text,
      });
    }

    currentY -= isFirstPage ? 55 : 75;
  }

  // Helper function to add footer
  function addFooter() {
    // Modern footer with subtle background
    currentPage.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: footerY + 20,
      color: colors.background,
    });

    currentPage.drawLine({
      start: { x: marginL, y: footerY + 18 },
      end: { x: pageWidth - marginR, y: footerY + 18 },
      thickness: 1.5,
      color: colors.accent,
    });

    currentPage.drawImage(logoImage, {
      x: marginL,
      y: footerY,
      width: logoWidth,
      height: logoHeight,
    });

    currentPage.drawText("Copyright © WiseStella 2025", {
      x: pageWidth - marginR - 120,
      y: footerY + 5,
      size: 9,
      font: poppinsFont,
      color: colors.textLight,
    });
  }

  // Add header and footer to first page
  addHeader();
  addFooter();

  // Process each competency
  for (const comp of competencies) {
    const estimatedHeight =
      compHeight +
      5 +
      comp.items.length * (itemHeight + commentBoxHeight + marginAfter + 20);
    if (currentY - estimatedHeight < footerY + 40) {
      addNewPage();
    }

    // Modern section header with colored background and rounded corners
    drawRoundedRect(
      marginL,
      currentY - compHeight,
      pageWidth - marginL - marginR,
      compHeight,
      4,
      colors.primaryLight,
      true
    );

    currentPage.drawText(`${comp.letter}. ${comp.title}`, {
      x: marginL + 8,
      y: currentY - 19,
      size: 15,
      font: poppinsFont,
      color: colors.primary,
    });
    currentY -= compHeight + 5;

    for (const item of comp.items) {
      // Item name with better styling (bolder)
      currentPage.drawText(`${item.id}. ${item.name}`, {
        x: marginL + 8,
        y: currentY - 12,
        size: 7.5,
        font: poppinsBoldFont,
        color: colors.text,
      });

      // Move to next line for radio buttons
      currentY -= radioLineHeight;

      const radioGroup = form.createRadioGroup(`rating_${item.id}`);
      const availW = pageWidth - marginL - marginR - 20;
      const spacing = availW / radioOptions.length;
      const yRadio = currentY - 15;

      // Color-coded radio options
      const ratingColors = [
        colors.danger,
        colors.warning,
        rgb(0.7, 0.7, 0.7),
        rgb(0.4, 0.7, 0.5),
        colors.success,
      ];

      radioOptions.forEach((label, i) => {
        const x = marginL + 15 + i * spacing;
        radioGroup.addOptionToPage(label, currentPage, {
          x,
          y: yRadio,
          width: radioDiam,
          height: radioDiam,
          borderColor: ratingColors[i],
          borderWidth: 1.5,
        });
        // Center label vertically with radio button
        currentPage.drawText(label, {
          x: x + radioDiam + 5,
          y: yRadio + 3,
          size: labelFontSize,
          font: poppinsFont,
          color: colors.textLight,
        });
      });
      currentY -= itemHeight - radioLineHeight;

      // Comment label
      currentPage.drawText("Comment:", {
        x: marginL + 8,
        y: currentY - 10,
        size: 7,
        font: poppinsFont,
        color: colors.textLight,
      });
      currentY -= 12;

      // Modern comment field with subtle border
      const commentField = form.createTextField(`comment_${item.id}`);
      commentField.addToPage(currentPage, {
        x: marginL + 8,
        y: currentY - commentBoxHeight - 5,
        width: pageWidth - marginL - marginR - 16,
        height: commentBoxHeight,
        borderColor: colors.border,
        borderWidth: 1,
        backgroundColor: rgb(1, 1, 1),
      });
      commentField.setFontSize(8);
      commentField.enableMultiline();
      currentY -= commentBoxHeight + marginAfter - 5;
    }

    currentY -= marginAfter + 5;
  }

  // Save to disk
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync("output.pdf", pdfBytes);
  console.log("✓ output.pdf written");
})();
