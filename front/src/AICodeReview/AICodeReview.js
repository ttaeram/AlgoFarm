import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { marked } from 'marked';
import './AICodeReview.css';

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

// 문제 데이터를 가져와서 팝업 화면에 표시하는 컴포넌트
const ProblemPopup = ({ problemData, solveData }) => {
  if (!problemData || !solveData || problemData.problemId !== solveData.solveId) {
    return <h2>문제 내용을 다시 확인하고<br/>새로운 코드를 제출해주세요.</h2>;
  }

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
        const answer = await result.response.text();
        console.log('AI의 답변:', answer);
        setAnswerFromAI(answer);
      }

      run();
    } else {
      setAnswerFromAI(null);
    }
  }, [problemData, solveData]);

  return (
    <div className="problem-popup">
      {answerFromAI ? (
        <div
          dangerouslySetInnerHTML={{ __html: marked(answerFromAI) }} // 마크다운을 HTML로 변환하여 출력
      />
      ) : (
        <div>
          <p>AI의 코드 리뷰를 로딩 중입니다.</p>
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
    popup.document.write('<link rel="stylesheet" href="' + chrome.runtime.getURL('AICodeReview.css') + '">');
    popup.document.close();
    const root = ReactDOM.createRoot(popup.document.getElementById('ai-code-root'));
    root.render(<ProblemPopup problemData={problemData} solveData={solveData} />);
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
