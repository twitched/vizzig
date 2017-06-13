//use node and katex, which must be installed to generate
//katex html to insert into page

katex = require("katex");

var sensitivity = "\\frac{TP}{TP + FN}";
var specificity = "\\frac{TN}{TN + FP}";
var precision = "\\frac{TP}{TP + FP}";
var accuracy = "\\frac{TP + TN}{TP + FP + FN + TN}";
var f1 = "\\frac{2TP}{(2TP + FP + FN)}";
var dprime = "\\frac{\\mu_S - \\mu_N}{\\sqrt{\\frac{1}{2}(\\sigma^2_S + \\sigma^2_N})}";
var auc = "\\int_\\infty^{-\\infty} (TPR(T))(FPR'(T)))\\,\\mathrm{d}T";
var posterior = "\\frac{TPR * BR}{TPR * BR + FPR * (1 - BR)}";

var sensitivity_html = katex.renderToString(sensitivity, {displayMode: true});
var specificity_html = katex.renderToString(specificity, {displayMode: true});
var precision_html = katex.renderToString(precision, {displayMode: true});
var accuracy_html = katex.renderToString(accuracy, {displayMode: true});
var f1_html = katex.renderToString(f1, {displayMode: true});
var dprime_html = katex.renderToString(dprime, {displayMode: true});
var auc_html = katex.renderToString(auc, {displayMode: true});
var posterior_html = katex.renderToString(posterior, {displayMode: true});

console.log("Sensitivity\n");
console.log(sensitivity_html);
console.log("\n\n");

console.log("Specificity\n");
console.log(specificity_html);
console.log("\n\n");

console.log("Precision\n");
console.log(precision_html);
console.log("\n\n");

console.log("Accuracy\n");
console.log(accuracy_html);
console.log("\n\n");

console.log("F1\n");
console.log(f1_html);
console.log("\n\n");

console.log("d prime\n");
console.log(dprime_html);
console.log("\n\n");

console.log("AUC\n");
console.log(auc_html);
console.log("\n\n");

console.log("Posterior\n");
console.log(posterior_html);
console.log("\n\n");
