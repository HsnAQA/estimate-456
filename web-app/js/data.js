(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CourseData = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // Course reference data shown by the web interface. The Python twin is
  // streamlit-app/ui_data.py, and the parity test compares both files.

  const FP_PARAMETERS = [
    ["inputs", "Number of user inputs"],
    ["outputs", "Number of user outputs"],
    ["inquiries", "Number of user inquiries"],
    ["files", "Number of files"],
    ["interfaces", "Number of external interfaces"],
  ];

  const GSC_QUESTIONS = [
    "Does the system require reliable backup and recovery?",
    "Are data communications required?",
    "Are there distributed processing functions?",
    "Is performance critical?",
    "Will the system run in an existing, heavily utilized operational environment?",
    "Does the system require on-line data entry?",
    "Does the on-line data entry require the input transaction to be built over multiple screens or operations?",
    "Are there master files updated on-line?",
    "Are the inputs, outputs, files, or inquiries complex?",
    "Is the internal processing complex?",
    "Is the code designed to be reusable?",
    "Are conversion and installation included in the design?",
    "Is the system designed for multiple installations in different organizations?",
    "Is the application designed to facilitate change and ease of use by the user?",
  ];

  const RATING_SCALE = ["No influence", "Incidental", "Moderate", "Average", "Significant", "Critical"];

  const CHARACTERISTICS = [
    ["Operational Ease", "The degree to which the application attends to operational aspects, such as backup, start-up, and recovery processes."],
    ["Data Communication", "The degree to which an application communicates with other applications."],
    ["Distributed Functions", "The degree to which an application transfers or shares data among application components."],
    ["Performance", "The degree to which response time and throughput performance influence the application."],
    ["Heavily Used Configuration", "The degree to which the computer resources where the application runs are used."],
    ["On-line Data Entry", "The percentage of data entered by using interactive transactions."],
    ["Transaction Rate", "The frequency of transactions executed on a daily, weekly, or monthly basis."],
    ["On-line Update", "The degree to which internal logical files are updated on-line."],
    ["End-user Efficiency", "The degree to which human factors and user friendliness must be considered."],
    ["Complex Processing", "The degree to which logic complexity influences processing and application development."],
    ["Reusability", "The degree to which the application and its code are designed, developed, and supported for reuse."],
    ["Installation Ease", "The degree to which conversion from a previous environment influences development."],
    ["Multiple Sites", "The degree to which the application is developed for multiple locations and user organizations."],
    ["Facilitates Change", "The degree to which the application is developed for easy modification of processing logic or data structures."],
  ];

  // Table 6 lists the characteristics in this order in the lecture.
  const EXAMPLE_GSC_NAMES = [
    "Operational Ease", "Data Communication", "Distributed Functions", "Performance",
    "Heavily Used Configuration", "Transaction Rate", "On-line Data Entry", "On-line Update",
    "End-user Efficiency", "Complex Processing", "Reusability", "Installation Ease",
    "Multiple Sites", "Facilitates Change",
  ];
  const EXAMPLE_GSC_VALUES = [2, 5, 4, 5, 2, 3, 4, 2, 3, 4, 5, 2, 3, 4];

  const EXAMPLES = {
    sloc: { loc: 33200, productivity: 620, developers: 6, laborRate: 800 },
    example1: {
      counts: { inputs: 13, outputs: 10, inquiries: 3, files: 4, interfaces: 2 },
      complexity: "average",
      influences: EXAMPLE_GSC_VALUES,
      language: "SQL/Oracle",
    },
    safeHome: {
      counts: { inputs: 3, outputs: 2, inquiries: 2, files: 1, interfaces: 4 },
      complexity: "simple",
      influences: [4, 4, 3, 4, 3, 3, 3, 3, 4, 4, 4, 3, 3, 1],
      language: "Object-Oriented Languages",
    },
    hours: { fp: 200, hoursPerFp: 10, hoursPerDay: 8, workDays: 20, developers: 2 },
    productivity: { fp: 375, productivity: 6.5, laborRate: 800 },
    defects: [
      { name: "Project 1", defects: 10, fp: 150 },
      { name: "Project 2", defects: 20, fp: 200 },
      { name: "Project 3", defects: 40, fp: 1000 },
    ],
    basicCocomo: { kloc: 4, mode: "organic", laborRate: 800 },
    // Table 10. Driver indexes refer to COCOMO_DRIVER_NAMES in logic.js.
    insurance: {
      kloc: 3,
      mode: "organic",
      laborRate: 800,
      drivers: [
        { index: 2, code: "SPC", rating: "High", multiplier: 1.2 },
        { index: 3, code: "ETC", rating: "Very High", multiplier: 1.35 },
        { index: 7, code: "AC", rating: "Low", multiplier: 0.95 },
        { index: 12, code: "MPP", rating: "Average", multiplier: 1.0 },
      ],
    },
    delphi: {
      threshold: 25,
      tasks: [
        { task: "Cost and benefit analysis", maximum: 20, minimum: 15 },
        { task: "High level design", maximum: 50, minimum: 30 },
      ],
    },
  };

  // Lecture-printed values, shown beside exact results and labeled as rounded.
  const LECTURE_ROUNDED = {
    productivity: "Lecture rounded example: $123 per FP, about $46,100 total cost, and about 58 person-months.",
    basicCocomo: "Lecture rounded example: 3.2 x 4^1.05 = 3.2 x 4.28, about 14 person-months.",
    intermediateCocomo: "Lecture rounded example: Ei = 3.2 x 3.16 = 10.11, EAF = 1.53, E = 1.53 x 10.11 = 15.5 person-months. The lecture rounds 3^1.05 to 3.16 and shortens EAF to 1.53, so exact results are slightly higher.",
  };

  const DELPHI_STEPS = [
    "Identify the teams that will estimate.",
    "Present project details to the expert group.",
    "Finalize the acceptable variance value.",
    "Prepare a list of tasks.",
    "Estimates done by the expert group.",
    "Prepare a summary of estimates for each task.",
    "Discuss tasks and assumptions for not acceptable estimates.",
    "Repeat steps until all estimates are finalized.",
  ];

  // Table 9 groups, as listed in the lecture. Indexes refer to COCOMO_DRIVER_NAMES in logic.js.
  const DRIVER_GROUPS = [
    { title: "Product attributes", indexes: [0, 1, 2] },
    { title: "Computer attributes", indexes: [3, 4, 5, 6] },
    { title: "Personnel attributes", indexes: [7, 8, 9, 10, 11] },
    { title: "Project attributes", indexes: [12, 13, 14] },
  ];

  // Short project type descriptions from the lecture text for Table 8.
  const COCOMO_MODE_NOTES = {
    organic: "Small, simple projects with an experienced team.",
    embedded: "Tight hardware, software, and operational constraints.",
    "semi-detached": "Intermediate size, mixed team experience.",
  };

  // Catalog of the 11 course tables. "page" is the calculator that uses the table.
  const COURSE_TABLES = [
    { number: 1, title: "Programming Language LOC/FP", group: "fp", page: "fp", note: "13 languages" },
    { number: 2, title: "Measurement Parameters", group: "fp", page: "fp", note: "5 parameters, 3 weights each" },
    { number: 3, title: "Complexity Weighting Factors", group: "fp", page: "fp", note: "14 questions, ratings 0 to 5" },
    { number: 4, title: "General System Characteristics", group: "fp", page: "fp", note: "14 characteristics" },
    { number: 5, title: "Example 1 Measurement Parameters", group: "fp", page: "fp", note: "Count Total (CT) = 168" },
    { number: 6, title: "Example 1 General System Characteristics", group: "fp", page: "fp", note: "Sum Fi = 48" },
    { number: 7, title: "Defect Density", group: "planning", page: "defects", note: "3 projects" },
    { number: 8, title: "COCOMO Constants", group: "cocomo", page: "cocomo", note: "3 project types" },
    { number: 9, title: "Intermediate COCOMO Cost Drivers", group: "cocomo", page: "cocomo", note: "15 cost drivers, 6 rating levels" },
    { number: 10, title: "Intermediate COCOMO Example", group: "cocomo", page: "cocomo", note: "EAF = 1.539" },
    { number: 11, title: "Delphi Summary of Estimates", group: "delphi", page: "delphi", note: "2 tasks, acceptable variance 25%" },
  ];

  return {
    DRIVER_GROUPS,
    COCOMO_MODE_NOTES,
    COURSE_TABLES,
    FP_PARAMETERS,
    GSC_QUESTIONS,
    RATING_SCALE,
    CHARACTERISTICS,
    EXAMPLE_GSC_NAMES,
    EXAMPLE_GSC_VALUES,
    EXAMPLES,
    LECTURE_ROUNDED,
    DELPHI_STEPS,
  };
});
