const fs = require('fs');

// Data rows structured with strict comma breaks: Question,OptionA,OptionB,OptionC,OptionD,Key
const questionBankPayload = [
  "What does CPU stand for?,Central Processing Unit,Computer Personal Unit,Control Power Utility,Core Protocol System,A",
  "Which protocol is used to secure web browsing data transactions?,HTTP,FTP,HTTPS,SMTP,C",
  "What is the binary representation of the decimal number 5?,101,111,100,011,A",
  "Which database command removes all test row line metrics cleanly?,DELETE,DROP,TRUNCATE,SELECT,C",
  "What primary color palette layer is assigned to the portal theme?,Emerald,Dark Navy,Crimson Gold,Light Gray,B"
].join('\n');

// Write the compiled array into a local file block
fs.writeFileSync('sheek_bakri_ict_quiz_template.csv', questionBankPayload, 'utf-8');
console.log("🚀 Success! 'sheek_bakri_ict_quiz_template.csv' has been generated in your workspace folder.");
