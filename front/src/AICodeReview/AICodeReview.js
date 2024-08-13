import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * escape된 문자열을 unescape하여 반환합니다.
 * @param {string} text - unescape할 문자열
 * @returns {string} - unescape된 문자열
 */
function unescapeHtml(text) {
  const unescaped = {
    '&amp;': '&',
    '&#38;': '&',
    '&lt;': '<',
    '&#60;': '<',
    '&gt;': '>',
    '&#62;': '>',
    '&apos;': "'",
    '&#39;': "'",
    '&quot;': '"',
    '&#34;': '"',
    '&nbsp;': ' ',
    '&#160;': ' ',
  };
  return text.replace(/&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160);/g, function (m) {
    return unescaped[m];
  });
}

// solveCode 데이터 전처리 함수
function getCleanedCode() {
  const codeElement = document.querySelector('.CodeMirror-code');
  if (!codeElement) { return 'No code available' };
  const gutterElements = codeElement.querySelectorAll('.CodeMirror-gutter-wrapper');
  gutterElements.forEach(el => el.remove());
  return unescapeHtml(codeElement.innerText || 'No code available');
}

/**
 * 문제 내용을 가져오는 함수
 * Fetch를 사용하여 정보를 구하는 함수로 다음 정보를 확인합니다.
 *   - 문제 번호: problemId
 *   - 문제 제목: problemTitle
 *   - 문제 설명: problemDescription
 *   - 문제 입력 설명: problemInput
 *   - 문제 출력 설명: problemOutput
 *   - 문제 입력 예제: sampleInput
 *   - 문제 출력 예제: sampleOutput
 */
async function getProblemDetails() {
  const problemId = document.getElementsByTagName('title')[0].textContent.split(':')[0].replace(/[^0-9]/, '');
  const problemTitle = unescapeHtml(document.getElementById('problem_title')?.innerText || 'No title available.');
  const problemDescription = unescapeHtml(document.getElementById('problem_description')?.innerText || 'No description available.');
  const problemInput = unescapeHtml(document.getElementById('problem_input')?.innerText || 'Empty');
  const problemOutput = unescapeHtml(document.getElementById('problem_output')?.innerText || 'Empty');
  const sampleInput = unescapeHtml(document.getElementById('sample-input-1')?.innerText || 'Empty');
  const sampleOutput = unescapeHtml(document.getElementById('sample-output-1')?.innerText || 'Empty');
  if (problemId && problemDescription) {
    console.log(`AI 코드 리뷰: 문제 내용을 조회합니다.`);
    return { problemId, problemTitle, problemDescription, problemInput, problemOutput, sampleInput, sampleOutput };
  }
  return {};
}

// sessionStorage에 problemData 저장
async function saveProblemDetailsToLocal() {
  const problemData = await getProblemDetails();
  console.log('문제 내용 데이터:', problemData);
  sessionStorage.setItem('problemData', JSON.stringify(problemData));
  console.log('AI 코드 리뷰: 세션 스토리지에 문제 내용을 저장했습니다.');
}

// sessionStorage에서 problemData 로드
async function loadProblemDetailsFromLocal() {
  return new Promise((resolve) => {
    const problemData = sessionStorage.getItem('problemData');
    if (problemData) {
      console.log('AI 코드 리뷰: 세션 스토리지에서 문제 내용 불러오기에 성공했습니다.');
      resolve(JSON.parse(problemData));
    } else {
      console.log('AI 코드 리뷰: 세션 스토리지에서 문제 내용 불러오기에 실패했습니다.');
      resolve(null);
    }
  });
}

/**
 * 제출 코드를 가져오는 함수
 * Fetch를 사용하여 정보를 구하는 함수로 다음 정보를 확인합니다.
 *   - 문제 번호: solveId
 *   - 제출 언어: solveLan
 *   - 제출 코드: solveCode
 */
async function getSolveDetails() {
  const solveId = document.getElementsByTagName('title')[0].textContent.replace(/[^0-9]/g, '');
  const solveLan = unescapeHtml(document.querySelector('.chosen-single')?.innerText || 'No language available.');
  const solveCode = getCleanedCode();
  if (solveId && solveCode) {
    console.log('AI 코드 리뷰: 제출 코드을 조회합니다.');
    return { solveId, solveLan, solveCode };
  }
  return {};
}

// sessionStorage에 solveData 저장
async function saveSolveDetailsToLocal() {
  const submitBtn = document.querySelector('#submit_button');
  if (submitBtn) {
    submitBtn.addEventListener('click', async (event) => {
      // 테스트 할 때는 아래 주석 해제
      // event.preventDefault()
      const solveData = await getSolveDetails();
      console.log('제출 코드 데이터:', solveData);
      sessionStorage.setItem('solveData', JSON.stringify(solveData));
      console.log('AI 코드 리뷰: 세션 스토리지에 제출 코드를 저장했습니다.');
    });
  }
}

// sessionStorage에서 solveData 로드
async function loadSolveDetailsFromLocal() {
  return new Promise((resolve) => {
    const solveData = sessionStorage.getItem('solveData');
    if (solveData) {
      console.log('AI 코드 리뷰: 세션 스토리지에서 제출 코드 불러오기에 성공했습니다.');
      resolve(JSON.parse(solveData));
    } else {
      console.log('AI 코드 리뷰: 세션 스토리지에서 제출 코드 불러오기에 실패했습니다.');
      resolve(null);
    }
  });
}

// 팝업 화면에 언어 표시 추가
function addLanguageToCodeBlocks(popupDocument) {
  const codeBlocks = popupDocument.querySelectorAll('pre code');

  if (codeBlocks) {
    codeBlocks.forEach((block) => {
      // 부모 <pre> 요소
      const pre = block.parentNode;
      pre.style.position = 'relative';
      pre.style.paddingTop = '30px';

      // 언어 표시를 위한 <div> 생성
      const languageLabel = popupDocument.createElement('div');
      const language = block.className.replace('language-', '') || 'plaintext';
      languageLabel.textContent = language;
      languageLabel.style.position = 'absolute';
      languageLabel.style.top = '5px';
      languageLabel.style.left = '10px';
      languageLabel.style.background = '#333';
      languageLabel.style.color = '#fff';
      languageLabel.style.padding = '2px 8px';
      languageLabel.style.fontSize = '12px';
      languageLabel.style.borderRadius = '3px';

      // <pre> 요소에 언어 표시와 복사 버튼 추가
      pre.appendChild(languageLabel);
    });
  };
}

// 문제 데이터를 가져와서 팝업 화면에 표시하는 컴포넌트
const ProblemPopup = ({ problemData, solveData, onRenderComplete }) => {
  if (!problemData || !solveData || problemData.problemId !== solveData.solveId) {
    return (
      <div style={{ margin: '45px' }}>
        <div>
          <h2>안내사항</h2>
          <div>
            <p>혹시 코드를 제출하지 않으셨습니까?</p>
            <ul>
              <li>
                새로운 코드를 제출해주시길 바랍니다.
              </li>
            </ul>
            <p>혹시 '내 제출' - '수정' 을 통해 코드를 제출하셨습니까?</p>
            <ul>
              <li>
                문제 페이지에서 내용을 다시 확인한 후,<br/>'AI 코드 리뷰' 버튼을 클릭해주시길 바랍니다.
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // AI 답변 관련 로직
  const [answerFromAI, setAnswerFromAI] = useState(null);

  useEffect(() => {
    // 향후 아래 3개를 비교하는 로직을 추가할 예정
    // - 현재 페이지의 문제 번호
    // - 문제 내용의 문제 번호 (problemData.problemId)
    // - 제출 코드의 문제 번호 (solveData.solveId)
    // url에 따라 현재 페이지의 문제 번호를 불러오는 로직이 다르기 때문에, 하드 코딩 필요
    if (problemData.problemId === solveData.solveId) {
      console.log('AI의 답변: 로드를 시작합니다.');
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash"
      });
      const generationConfig = {
        temperature: 0.85,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      };

      async function run() {
        const chat = model.startChat({
          generationConfig,
          history: [
            {
              role: "user",
              parts: [{ text: "너는 알고리즘 문제 풀이 코드를 리뷰해주는 전문가야. 한국어로 대답해줘." }],
            },
            {
              role: "model",
              parts: [{ text: "문제에 대한 설명을 제공해주세요." }],
            },
            {
              role: "user",
              parts: [{ text: `
                문제에 대한 정보는 다음과 같아.
                문제 번호: ${problemData.problemId},
                문제 제목: ${problemData.problemTitle},
                문제 설명: ${problemData.problemDescription},
                문제 입력 설명: ${problemData.problemInput},
                문제 입력 예제: ${problemData.sampleInput},
                문제 출력 설명: ${problemData.problemOutput},
                문제 출력 예제: ${problemData.sampleOutput}
                ` }],
            },
            {
              role: "model",
              parts: [{ text: "해당 문제를 풀 때 사용한 언어를 알려주세요." }],
            },
            {
              role: "user",
              parts: [{ text: `내가 사용한 언어는 ${solveData.solveLan} 이야.` }],
            },
            {
              role: "model",
              parts: [{ text: "해당 문제를 풀이한 코드를 제공해주세요." }],
            },
            {
              role: "user",
              parts: [{ text: `
                내가 풀이한 코드는 다음과 같아.
                ${solveData.solveCode}
                ` }],
            },
          ],
        });
        const msg = "문제 내용을 바탕으로 내 풀이 코드에서 보완할 점을 알려줘.";
        const result = await chat.sendMessage(msg);
        const answer = result.response.text();
        console.log('AI의 답변:', answer);

        // 보안 이슈 1 : 마크다운을 HTML로 변환 후, DOMPurify로 정화
        //   dangerouslySetInnerHTML를 사용하기 때문에, XSS 공격의 위험이 있음.
        //     XSS 공격 (Cross Site Scripting):
        //     공격자가 상대방의 브라우저에 스크립트가 실행되도록 하여
        //     사용자의 세션을 가로채거나,
        //     웹사이트를 변조하거나,
        //     악의적 콘텐츠를 삽입하거나,
        //     피싱 공격을 진행하는 것
        const dirtyHtml = marked(answer);
        const cleanHtml = DOMPurify.sanitize(dirtyHtml);
        setAnswerFromAI(cleanHtml);
      }

      run();
    } else {
      setAnswerFromAI(null);
    }
  }, [problemData, solveData]);

  // 언어 표시 추가
  useEffect(() => {
    if (answerFromAI && onRenderComplete) {
      onRenderComplete();
    }
  }, [answerFromAI, onRenderComplete]);

  // 로딩 텍스트 변경 로직
  const [loadingDots, setLoadingDots] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLoadingDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500); // 0.5초 간격으로 점 추가
    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 클리어
  }, []);

  return (
    <div style={{ margin: '45px' }}>
      {answerFromAI ? (
        <div>
          <h2>{problemData.problemId}: {problemData.problemTitle}</h2>
          <div
            dangerouslySetInnerHTML={{ __html: answerFromAI }} // 마크다운을 HTML로 변환 후, 안전하게 정화된 HTML로 출력
          />
        </div>
      ) : (
        <div>
          <h2>{problemData.problemId}: {problemData.problemTitle}</h2>
          <div>
            <p>AI의 코드 리뷰를 로딩 중입니다{loadingDots}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// React 컴포넌트를 렌더링하는 함수
function renderOverlay(problemData, solveData) {
  const popup = window.open('', 'AI Code Review', 'width=600,height=800');
  if (popup) {
    popup.document.write('<div id="ai-code-root"></div>');

    // 깃허브 마크다운 CSS
    //   크롬 익스텐션에서는 팝업 윈도우가 부모 페이지와 다른 컨텍스트에서 실행되기 때문에,
    //   크롬 익스텐션 외부의 팝업 윈도우가 CSS 파일에 접근하지 못하는 문제가 발생했다.
    //   이에 CDNJS 서비스를 사용하여 깃허브 마크다운 CSS를 적용했다.
    // 보안 이슈 2 : CDN 방식은 위험하다
    //   최근 카카오 사태에서 경험했듯이,
    //   다수가 사용하는 CDN에 장애가 발생하거나 해커가 공격할 경우 문제가 발생할 여지가 있다.
    //   이에 github-markdown-css 라이브러리를 설치하여 사용하는 것으로 권장하나,
    //   익스텐션 외부에서 CSS 파일에 접근할 수 없기 때문에 사용할 수 없다.
    //   추후 보안 이슈 관련하여 대책을 마련하고 적용할 예정이다.
    // 해결 방법 1 : 팝업 대신 모달 사용
    //   팝업 창 대신 모달 창을 사용하면,
    //   모달 창은 부모 페이지와 동일한 컨텍스트에서 실행되기 때문에, CSS 파일에 접근할 수 있다.
    //   하지만 팝업 창의 경우, 코드 리뷰 팝업 창을 켠 상태로 다른 창을 동시에 비교할 수 있다는 장점이 있다.
    //   UX 관점에서 팝업 창이 더 좋다고 판단하여, 기존대로 팝업 창으로 진행하되 보안 문제를 해결할 방법을 모색하고 있다.
    // 해결 방법 2 : 인라인 CSS
    //   하지만 이 경우 코드가 복잡해지기 때문에, 최후의 방법으로 남겨둘 예정이다.
    const externalCss = popup.document.createElement('link');
    externalCss.rel = 'stylesheet';
    externalCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.6.1/github-markdown-dark.css';
    popup.document.head.appendChild(externalCss);

    popup.document.body.classList.add('markdown-body');
    popup.document.close();

    const root = ReactDOM.createRoot(popup.document.getElementById('ai-code-root'));
    root.render(<ProblemPopup
      problemData={problemData}
      solveData={solveData}
      onRenderComplete={() => addLanguageToCodeBlocks(popup.document)}
    />);
  } else {
    console.error('Popup blocked');
  }
}

// 페이지 로드 후 "AI 코드 리뷰" 버튼 추가
async function addButton() {
  const problemMenu = document.querySelector('.problem-menu');
  if (problemMenu) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.id = 'ai-review-button';
    a.textContent = 'AI 코드 리뷰';
    a.href = '#';
    a.onclick = async (event) => {
      event.preventDefault();
      const problemData = await loadProblemDetailsFromLocal();
      const solveData = await loadSolveDetailsFromLocal();
      renderOverlay(problemData, solveData);
    };
    li.appendChild(a);
    problemMenu.appendChild(li);
    console.log('AI 코드 리뷰: 코드 리뷰 버튼이 추가되었습니다.');
  } else {
    console.log('AI 코드 리뷰: 문제 정보를 찾을 수 없습니다.');
  }
}

// 공통 로직 실행
document.addEventListener('DOMContentLoaded', async () => {
  console.log('AI 코드 리뷰: AI 코드 리뷰가 시작되었습니다.');
  await addButton();
  if (/https:\/\/www\.acmicpc\.net\/problem\/\d+/.test(window.location.href)) {
    console.log('AI 코드 리뷰: 새 문제가 감지되었습니다.');
    await saveProblemDetailsToLocal();
  } else if (/^https:\/\/www\.acmicpc\.net\/submit\/\d+(\/\d+)?$/.test(window.location.href)) {
    console.log('AI 코드 리뷰: 문제 풀이를 시작합니다.')
    await saveSolveDetailsToLocal();
  }
});
