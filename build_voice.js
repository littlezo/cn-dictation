const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require('fs');
var crypto = require('crypto');

function md5(password) {
  var md5 = crypto.createHash('md5');
  return md5.update(password).digest('hex');
}

const VOICE_BREAK_MS = 750
const BOOK_DIR = './books';
const GRADE_MAP = { '1': '一年级', '2': '二年级', '3': '三年级', '4': '四年级', '5': '五年级', '6': '六年级' }
const TERM_MAP = { 'a': '上册', 'b': '下册', 'A': '上册', 'B': '下册' }

var subscriptionKey = fs.readFileSync('.voice_key', 'utf8').trim();
const serviceRegion = "eastasia";


const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
speechConfig.speechSynthesisVoiceName = "zh-CN-XiaoyouNeural"; 

async function text2voice(text, filePath) {
  const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filePath);
  let synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
  return new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(`<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${speechConfig.speechSynthesisVoiceName}">${text}</voice></speak>`,
      function (result) {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          synthesizer.close();
          synthesizer = undefined;
          resolve()
        } else {
          const errMsg = "Speech synthesis canceled, " + result.errorDetails;
          synthesizer.close();
          synthesizer = undefined;
          reject(errMsg)
        }
      },
      function (err) {
        console.error(err);
        synthesizer.close();
        synthesizer = undefined;
        reject(err)
      }
    );
  });
}

function getTxtSuffixList(dirPath) {
  const files = fs.readdirSync(dirPath);
  const txtSuffixList = files.filter((file) => {
    const suffix = file.split('.').pop();
    return suffix === 'txt';
  });
  return txtSuffixList;
}

function getValidBookFileNames() {
  const allTxt = getTxtSuffixList(BOOK_DIR);
  const standardBookFile = allTxt.filter((fileName) => {
    return /\d\.[ab]\.txt/g.test(fileName)
  }).sort((a, b) => {
    return a.localeCompare(b, 'zh-CN');
  });
  return standardBookFile;
}
function removeXMLTag(str) {
  return str.replace(/<[^>]+>/g, "");
}

async function buildBookData(fileName) {
  const book = { }
  const fileNameBySection = fileName.split('.')
  const term = TERM_MAP[fileNameBySection[1]];
  const grade = GRADE_MAP[fileNameBySection[0]];
  const bookName = `${grade}（${term}）`;
  book.name = bookName;
  book.grade = fileNameBySection[0];
  book.term = fileNameBySection[1];
  book.fileName = fileName;
  book.klasses = [];
  // 读取文件内容
  const bookContent = fs.readFileSync(`${BOOK_DIR}/${fileName}`, 'utf-8');
  const rows = bookContent.split(/\r?\n/)
  let klass;
  for (const row of rows) {
    if (/^\s*$/g.test(row)) {
      continue;
    }
    if (/^#+.*/g.test(row)) {
      // 课程标题行
      klass = { title: row.replaceAll(/^#\s*/g, ''), newChars: [] };
      book.klasses.push(klass);
      continue;
    }
    // 新字行
    const [newChar, words] = row.split('：');
    // md5(row + VOICE_BREAK_MS) 作为文件名
    const fileName = md5(`${row}${VOICE_BREAK_MS}`);
    const httpPath = `/v/${fileName}.wav`;
    const httpPathMp3 = `/v/${fileName}.mp3`;
    const filePath = `./public${httpPath}`;
    const filePathMp3 = `./public${httpPathMp3}`;
    // 判断filePath是否存在
    if (!fs.existsSync(filePath) && !fs.existsSync(filePathMp3)) {
      // 生成音频文件
      console.log(`正在生成音频文件：${bookName} - ${klass.title} - ${row}`);
      const voiceText = `${newChar}<break time="${VOICE_BREAK_MS}ms" />${words}${words.indexOf('、')>=0?'':('的' + newChar)}`;
      await text2voice(voiceText, filePath);
    }
    klass.newChars.push({ newChar:removeXMLTag(newChar), words:removeXMLTag(words), v: httpPath.replaceAll(/\.wav/g, '.mp3') });
  }

  return Promise.resolve(book);
}
function deleteUselessWavs(books) {
  const bookFileNames = [];
  for (const book of books) {
    for (const klass of book.klasses) {
      bookFileNames.push(...klass.newChars.map((newChar) => {
        return newChar.v.split('/').pop().split('.').shift();
      }));
    }
  }
  const allWavs = fs.readdirSync('./public/v');
  const uselessWavs = allWavs.filter((wav) => {
    return !bookFileNames.includes(wav.split('.').shift());
  });
  for (const wav of uselessWavs) {
    console.log(`删除无用音频文件：${wav}`);
    fs.unlinkSync(`./public/v/${wav}`);
  }
}

async function main() {
  // await text2voice('找：找人、找到', './src/assets/test.wav')
  const standardBookFile = getValidBookFileNames();
  const books = [];
  for (const bookFileName of standardBookFile) {
    const book = await buildBookData(bookFileName)
    books.push(book);
  }
  deleteUselessWavs(books);
  // 格式化输出book到export default
  const bookStr = JSON.stringify(books, null, 2);
  const exportStr = `export default ${bookStr}`;
  // 写入文件./src/books.js（覆盖）
  fs.writeFileSync('./src/books.js', exportStr);
}

main();