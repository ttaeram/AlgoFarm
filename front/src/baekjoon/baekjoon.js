// Set to true to enable console log
const debug = false;

/* 
  문제 제출 맞음 여부를 확인하는 함수
  2초마다 문제를 파싱하여 확인
*/
let loader;

const currentUrl = window.location.href;

// 문제 제출 사이트의 경우에는 로더를 실행하고, 유저 페이지의 경우에는 버튼을 생성한다.
// 백준 사이트 로그인 상태이면 username이 있으며, 아니면 없다.
const username = findUsername();
if (!isNull(username)) {findData
  if (['status', `user_id=${username}`, 'problem_id', 'from_mine=1'].every((key) =>
    currentUrl.includes(key))) startLoader();
  else if (currentUrl.match(/\.net\/problem\/\d+/) !== null) parseProblemDescription();
}

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
          bojData.username += `_${bojData.problemId}`
          console.log("전송데이터 (JSON):", JSON.stringify(bojData, null, 2));
          
          //헤더에 넣을 토큰 정보 가져오기
          // const data = await getDataFromIndexedDB();
          console.log("data="+data);

        //Background script에 메시지를 보내고, IndexedDB에서 데이터를 가져옵니다.
          chrome.runtime.sendMessage({ action: 'getToken' }, (response) => {
            if (response && response.token) {
              console.log(`indexDB에서 가져온 토큰은? = ${response.token}`);
              // Fetch 요청을 수행하고, 응답을 콘솔에 출력합니다.
              fetch("http://localhost:8080/api/commits", {
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

          
          // TODO 임시주석처리 api요청
          // fetch("http://localhost:8080/api/commits", {
          //   method:"POST",
          //   headers: {
          //     'Content-Type' : 'application/json',
          //     'Authorization': 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJzMzAyZm91bmRAZ21haWwuY29tIiwiaWF0IjoxNzIyMzE5NTg3LCJleHAiOjE3MjI0MDU5ODd9.SLBvBvB3MKc1gVt-kW_CXDuV7HxbZMrrdGW5ahc5LISnrMZIq80BDeFMP1O6drhuggU3kjQvO841SPwYYPhXsEZMs76b_3Zqh2UjIZfgwmskLrZfn8v2cec_vFkYp_jIdvv0IHiTFrh5NqIbz_8KFXbjeRB0PNWGXSF9JJ_WLopw354tXEPxgDCoYUoDaE38GDnUQAF_ZU2qkvw7NffHPSNaEGNXYDEKKN_c_FoogPxbCHAoz0r-xM4-DRNlt2I8FrAPuDYrAvSBjTZF_I_sySjIen3er-S8LoWPSL-pcg6_5CIg6mIOWicyqUrIZZWm5VTntrHC8P6r4IxPCE-BpA'
          //   },
          //   body: JSON.stringify(bojData)
          // })
          // .then((res) => {console.log("응답 : ", res);});
          // await beginUpload(bojData); // 이 함수가 제출하는 커밋 올리는 함수
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

