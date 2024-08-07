//import { NoSim } from "@mui/icons-material";

// 현재 페이지의 URL을 가져옴
const submitUrl = window.location.href;

// URL이 특정 패턴을 따르는지 검사하는 정규식
const urlPattern = /^https:\/\/www\.acmicpc\.net\/submit\/\d+(\/\d+)?$/;

if (urlPattern.test(submitUrl)) {
    console.log("URL이 올바른 패턴을 따릅니다. 코드를 추출합니다.");
    console.log(submitUrl);
    // 문제 번호를 추출
    const urlSegments = submitUrl.split('/');
    const problemId = urlSegments[urlSegments.indexOf("submit") + 1];

    console.log('urlSegments', urlSegments);
    console.log('problemId', problemId);

    setTimeout(function() {
      run(problemId);
    }, 5000)

    // 이후에 HTML을 가져오고, 코드를 추출하는 작업을 수행
} else {
    console.log("URL이 예상한 패턴과 일치하지 않습니다.");
}

// HTML을 가져오고 코드를 추출하는 전체 로직 실행 함수
async function run(problemId) {
    console.log('run 돌아갔지롱');
    const url = `https://www.acmicpc.net/submit/${problemId}`;
    const htmlContent = await fetchHtmlContent(url);

    // const codeTextarea = document.querySelector('textarea.codemirror-textarea');
    const codeTextarea = document.querySelector('.cm-variable')
    console.log("ㅋㅅㅋ" + codeTextarea.textContent)
    console.log("ㅎㅅㅎ" + codeTextarea.innerHTML)
    
    if (codeTextarea) {
      sessionStorage.setItem('submittedCode', codeTextarea); // 코드를 세션 스토리지에 저장
    }
}

// URL에서 HTML 내용을 가져오는 함수
async function fetchHtmlContent(url) {
  console.log('fetchHtmlContent')
    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include' // 쿠키 포함
        });

        if (!response.ok) {
            throw new Error(`네트워크 응답이 실패했습니다. 상태 코드: ${response.status}`);
        }
        //console.log("response" + response.json())

        const htmlText = response.text();
        return htmlText;
    } catch (error) {
        console.error('HTML을 가져오는 중 오류 발생:', error);
        return null;
    }
}

// HTML 내용을 파싱하여 코드 부분을 추출하는 함수
function extractCodeFromHtml(htmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // CodeMirror가 초기화되는 textarea 요소를 찾음
    const codeTextarea = doc.querySelector('textarea.codemirror-textarea');

    if (codeTextarea) {
        return codeTextarea.value;
    } else {
        console.error('코드 작성 부분을 찾을 수 없습니다.');
        return null;
    }
}

// DOM이 완전히 로드된 후 제출 버튼에 이벤트 리스너 추가
function addSubmitListener() {
    const submitButton = document.getElementById('submit_button');
    console.log('submitButton1',submitButton);

    if (submitButton) {
      console.log('submitButton', submitButton)
        submitButton.addEventListener('click', function (event) {
            console.log("제출 버튼 클릭 이벤트 발생"); // 로그 추가
            console.log(event)

            // 코드 추출
            const codeTextarea = document.querySelector('textarea.codemirror-textarea');
            const codeContent = codeTextarea ? codeTextarea.value : null;
            console.log(codeContent)

            if (codeContent) {
                console.log('코드가 세션 스토리지에 저장되었습니다:', codeContent);
                sessionStorage.setItem('submittedCode', codeContent); // 코드를 세션 스토리지에 저장
            } else {
                console.error('코드를 가져올 수 없습니다.');
            }

            // 기본 제출 동작을 막지 않음, 세션 스토리지에 저장 후 수동으로 폼 제출
            submitButton.closest('form').submit();
        });
    } else {
        console.error('제출 버튼을 찾을 수 없습니다.');
    }
}

// DOM이 로드되었는지 확인하고 이벤트 리스너 추가
document.addEventListener('DOMContelontLoaded', addSubmitListener);

// status 페이지로 이동했을 때 저장된 코드를 확인
const testUrl = window.location.href;

if (testUrl.startsWith('https://www.acmicpc.net/status')) {
    const savedCode = sessionStorage.getItem('submittedCode');
    console.log('savedCode',savedCode)
    if (savedCode) {
        console.log('저장된 코드:', savedCode);
    } else {
        console.log('저장된 코드가 없습니다.');
    }
}











// Set to true to enable console log
const debug = false;







/* 
  문제 제출 맞음 여부를 확인하는 함수
  2초마다 문제를 파싱하여 확인
*/
let loader;

const currentUrl = window.location.href;
console.log("currentUrl=",currentUrl)

// 문제 제출 사이트의 경우에는 로더를 실행하고, 유저 페이지의 경우에는 버튼을 생성한다.
// 백준 사이트 로그인 상태이면 username이 있으며, 아니면 없다.
// const username = findUsername();
// if (!isNull(username)) {findData
//   if (['status', `user_id=${username}`, 'problem_id', 'from_mine=1'].every((key) =>
//     currentUrl.includes(key))) startLoader();
//   else if (currentUrl.match(/\.net\/problem\/\d+/) !== null) parseProblemDescription();
// }
chrome.storage.local.get('isLogined', (result) => {
  if (result.isLogined) {
    // 로그인 상태일 때만 로더 실행
    const username = findUsername();
    if (!isNull(username)) {
      if (['status', `user_id=${username}`, 'problem_id', 'from_mine=1'].every((key) =>
        currentUrl.includes(key))) startLoader();
      else if (currentUrl.match(/\.net\/problem\/\d+/) !== null) parseProblemDescription();
    }
  } else {
    console.log('사용자가 로그인되지 않았습니다. startLoader를 실행하지 않습니다.');
  }
});

  function startLoader() {
    loader = setInterval(async () => {
      // 기능 Off시 작동하지 않도록 함
      const enable = await checkEnable();
      if (!enable) stopLoader();
      else if (isExistResultTable()) {
        const table = findFromResultTable();
        if (isEmpty(table)) return;
        const data = table[0];
        if (data.hasOwnProperty('username') && data.hasOwnProperty('resultCategory')) {
          const { username, resultCategory } = data;
          if (username === findUsername() && resultCategory.includes(RESULT_CATEGORY.RESULT_JUDGING)) {
            //채점중
            uploadJudgingAni();
          } else if (username === findUsername() && resultCategory.includes(RESULT_CATEGORY.RESULT_WRONG_ANSWER)) {
            //실패
            failedAni();
            stopLoader();
          } else if ((username === findUsername() && resultCategory.includes(RESULT_CATEGORY.RESULT_TIME_LIMIT_EXCEEDED)) || resultCategory.includes(RESULT_CATEGORY.RESULT_RUNTIME_ERROR)) {
            errorTimeLimitAni();
            stopLoader();
          } else if (username === findUsername() && resultCategory.includes(RESULT_CATEGORY.RESULT_MEMORY_LIMIT_EXCEEDED)) {
            errorMemoryLimitAni();
            stopLoader();
          } else if (username === findUsername() && resultCategory.includes(RESULT_CATEGORY.RESULT_OUTPUT_LIMIT_EXCEEDED)) {
            errorOutputLimitAni();
            stopLoader();
          } else if (username === findUsername() && resultCategory.includes(RESULT_CATEGORY.RESULT_COMPILATION_ERROR)) {
            errorCompilationAni();
            stopLoader();
          } else if (username === findUsername() && (resultCategory.includes(RESULT_CATEGORY.RESULT_ACCEPTED) || resultCategory.includes(RESULT_CATEGORY.RESULT_ENG_ACCEPTED))) {
            //맞았을때 보여지는 부분을 담당하는 함수
            successAni();
            stopLoader();
  
            console.log('풀이가 맞았습니다. 업로드를 시작합니다.');
            chrome.storage.local.get('bjhEnable', (result) => {
              console.log('bjhEnable:', result.bjhEnable);
            });
  
            //startUpload();이거 뭔가요...?
            const bojData = await findData()
            // console.log("username=" , bojData.username);
            bojData.username += `_${bojData.problemId}`
            console.log("전송데이터 (JSON):", JSON.stringify(bojData, null, 2));
            
  
            //Background script에 메시지를 보내고, IndexedDB에서 데이터를 가져옵니다.
            chrome.runtime.sendMessage({ action: 'getToken' }, (response) => {
              if (response && response.token) {
                console.log("토큰을 가져왔습니다.")
                // console.log(`indexDB에서 가져온 토큰은? = ${response.token}`);
                // Fetch 요청을 수행하고, 응답을 콘솔에 출력합니다.
                // fetch("http:localhost:8080/api/commits", {
                fetch("https://i11a302.p.ssafy.io/api/commits", {
                  method: "POST",
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${response.token}`
                  },
                  body: JSON.stringify(bojData) // 여기에 bojData를 대체
                })
                .then((res) => {
                  console.log("응답 : ", res);
                });
              } else {
                console.error('Token not found in response');
              }
            });
          }
        }
      }
    }, 2000);
    //
  }


function stopLoader() {
  clearInterval(loader);
  loader = null;
}

function toastThenStopLoader(toastMessage, errorMessage) {
  Toast.raiseToast(toastMessage);
  stopLoader();
  throw new Error(errorMessage);
}

/* 파싱 직후 실행되는 함수 */
async function beginUpload(bojData) {
  bojData = preProcessEmptyObj(bojData);
  if (isNotEmpty(bojData)) {
    const stats = await getStats();
    const hook = await getHook();

    const currentVersion = stats.version;
    /* 버전 차이가 발생하거나, 해당 hook에 대한 데이터가 없는 경우 localstorage의 Stats 값을 업데이트하고, version을 최신으로 변경한다 */
    if (isNull(currentVersion) || currentVersion !== getVersion() || isNull(await getStatsSHAfromPath(hook))) {
      await versionUpdate();
    }

    /* 현재 제출하려는 소스코드가 기존 업로드한 내용과 같다면 중지 */
    cachedSHA = await getStatsSHAfromPath(`${hook}/${bojData.directory}/${bojData.fileName}`);
    calcSHA = calculateBlobSHA(bojData.code);
    log('cachedSHA', cachedSHA, 'calcSHA', calcSHA);

    if (cachedSHA == calcSHA) {
      markUploadedCSS(stats.branches, bojData.directory);
      console.log(`현재 제출번호를 업로드한 기록이 있습니다.` /* submissionID ${bojData.submissionId}` */);
      return;
    }
    /*신규 제출 번호라면 새롭게 커밋  */
    /* uploadfunctions.js 파일의 함수이다. */
    await uploadOneSolveProblemOnGit(bojData, markUploadedCSS);
  }
}

async function versionUpdate() {
  log('start versionUpdate');
  const stats = await updateLocalStorageStats();
  // update version.
  stats.version = getVersion();
  await saveStats(stats);
  log('stats updated.', stats);
}


/*
  indexDB에서 Authorization 토큰을 가져오기 위한 로직
*/
function getDataFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MyDatabase', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('MyStore', 'readonly');
      const store = transaction.objectStore('MyStore');
      const getRequest = store.get('myData');

      getRequest.onsuccess = (event) => {
        resolve(event.target.result?.value);
      };

      getRequest.onerror = (event) => {
        reject('Error getting data from IndexedDB');
      };
    };

    request.onerror = (event) => {
      reject('Error opening IndexedDB');
    };
  });
}

