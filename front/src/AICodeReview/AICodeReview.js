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
    // console.log(`AI 코드 리뷰: 문제 내용을 조회합니다.`);
    return { problemId, problemTitle, problemDescription, problemInput, problemOutput, sampleInput, sampleOutput };
  }
  return {};
}

// sessionStorage에 problemData 저장
async function saveProblemDetailsToLocal() {
  const problemData = await getProblemDetails();
  // console.log('문제 내용 데이터:', problemData);
  sessionStorage.setItem('problemData', JSON.stringify(problemData));
  // console.log('AI 코드 리뷰: 세션 스토리지에 문제 내용을 저장했습니다.');
}

// sessionStorage에서 problemData 로드
async function loadProblemDetailsFromLocal() {
  return new Promise((resolve) => {
    const problemData = sessionStorage.getItem('problemData');
    if (problemData) {
      // console.log('AI 코드 리뷰: 세션 스토리지에서 문제 내용 불러오기에 성공했습니다.');
      resolve(JSON.parse(problemData));
    } else {
      // console.log('AI 코드 리뷰: 세션 스토리지에서 문제 내용 불러오기에 실패했습니다.');
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
    // console.log('AI 코드 리뷰: 제출 코드을 조회합니다.');
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
      // console.log('제출 코드 데이터:', solveData);
      sessionStorage.setItem('solveData', JSON.stringify(solveData));
      // console.log('AI 코드 리뷰: 세션 스토리지에 제출 코드를 저장했습니다.');
    });
  }
}

// sessionStorage에서 solveData 로드
async function loadSolveDetailsFromLocal() {
  return new Promise((resolve) => {
    const solveData = sessionStorage.getItem('solveData');
    if (solveData) {
      // console.log('AI 코드 리뷰: 세션 스토리지에서 제출 코드 불러오기에 성공했습니다.');
      resolve(JSON.parse(solveData));
    } else {
      // console.log('AI 코드 리뷰: 세션 스토리지에서 제출 코드 불러오기에 실패했습니다.');
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
      // console.log('AI의 답변: 로드를 시작합니다.');
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
        // console.log('AI의 답변:', answer);

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
    const styleElement = popup.document.createElement('style');

    popup.document.head.appendChild(styleElement);
    styleElement.textContent = `@media (prefers-color-scheme: dark) {
      .markdown-body {
        color-scheme: dark;
        --color-prettylights-syntax-comment: #8b949e;
        --color-prettylights-syntax-constant: #79c0ff;
        --color-prettylights-syntax-entity: #d2a8ff;
        --color-prettylights-syntax-storage-modifier-import: #c9d1d9;
        --color-prettylights-syntax-entity-tag: #7ee787;
        --color-prettylights-syntax-keyword: #ff7b72;
        --color-prettylights-syntax-string: #a5d6ff;
        --color-prettylights-syntax-variable: #ffa657;
        --color-prettylights-syntax-brackethighlighter-unmatched: #f85149;
        --color-prettylights-syntax-invalid-illegal-text: #f0f6fc;
        --color-prettylights-syntax-invalid-illegal-bg: #8e1519;
        --color-prettylights-syntax-carriage-return-text: #f0f6fc;
        --color-prettylights-syntax-carriage-return-bg: #b62324;
        --color-prettylights-syntax-string-regexp: #7ee787;
        --color-prettylights-syntax-markup-list: #f2cc60;
        --color-prettylights-syntax-markup-heading: #1f6feb;
        --color-prettylights-syntax-markup-italic: #c9d1d9;
        --color-prettylights-syntax-markup-bold: #c9d1d9;
        --color-prettylights-syntax-markup-deleted-text: #ffdcd7;
        --color-prettylights-syntax-markup-deleted-bg: #67060c;
        --color-prettylights-syntax-markup-inserted-text: #aff5b4;
        --color-prettylights-syntax-markup-inserted-bg: #033a16;
        --color-prettylights-syntax-markup-changed-text: #ffdfb6;
        --color-prettylights-syntax-markup-changed-bg: #5a1e02;
        --color-prettylights-syntax-markup-ignored-text: #c9d1d9;
        --color-prettylights-syntax-markup-ignored-bg: #1158c7;
        --color-prettylights-syntax-meta-diff-range: #d2a8ff;
        --color-prettylights-syntax-brackethighlighter-angle: #8b949e;
        --color-prettylights-syntax-sublimelinter-gutter-mark: #484f58;
        --color-prettylights-syntax-constant-other-reference-link: #a5d6ff;
        --color-fg-default: #c9d1d9;
        --color-fg-muted: #8b949e;
        --color-fg-subtle: #484f58;
        --color-canvas-default: #0d1117;
        --color-canvas-subtle: #161b22;
        --color-border-default: #30363d;
        --color-border-muted: #21262d;
        --color-neutral-muted: rgba(110,118,129,0.4);
        --color-accent-fg: #58a6ff;
        --color-accent-emphasis: #1f6feb;
        --color-attention-subtle: rgba(187,128,9,0.15);
        --color-danger-fg: #f85149;
      }
    }

    @media (prefers-color-scheme: light) {
      .markdown-body {
        color-scheme: light;
        --color-prettylights-syntax-comment: #6e7781;
        --color-prettylights-syntax-constant: #0550ae;
        --color-prettylights-syntax-entity: #8250df;
        --color-prettylights-syntax-storage-modifier-import: #24292f;
        --color-prettylights-syntax-entity-tag: #116329;
        --color-prettylights-syntax-keyword: #cf222e;
        --color-prettylights-syntax-string: #0a3069;
        --color-prettylights-syntax-variable: #953800;
        --color-prettylights-syntax-brackethighlighter-unmatched: #82071e;
        --color-prettylights-syntax-invalid-illegal-text: #f6f8fa;
        --color-prettylights-syntax-invalid-illegal-bg: #82071e;
        --color-prettylights-syntax-carriage-return-text: #f6f8fa;
        --color-prettylights-syntax-carriage-return-bg: #cf222e;
        --color-prettylights-syntax-string-regexp: #116329;
        --color-prettylights-syntax-markup-list: #3b2300;
        --color-prettylights-syntax-markup-heading: #0550ae;
        --color-prettylights-syntax-markup-italic: #24292f;
        --color-prettylights-syntax-markup-bold: #24292f;
        --color-prettylights-syntax-markup-deleted-text: #82071e;
        --color-prettylights-syntax-markup-deleted-bg: #FFEBE9;
        --color-prettylights-syntax-markup-inserted-text: #116329;
        --color-prettylights-syntax-markup-inserted-bg: #dafbe1;
        --color-prettylights-syntax-markup-changed-text: #953800;
        --color-prettylights-syntax-markup-changed-bg: #ffd8b5;
        --color-prettylights-syntax-markup-ignored-text: #eaeef2;
        --color-prettylights-syntax-markup-ignored-bg: #0550ae;
        --color-prettylights-syntax-meta-diff-range: #8250df;
        --color-prettylights-syntax-brackethighlighter-angle: #57606a;
        --color-prettylights-syntax-sublimelinter-gutter-mark: #8c959f;
        --color-prettylights-syntax-constant-other-reference-link: #0a3069;
        --color-fg-default: #24292f;
        --color-fg-muted: #57606a;
        --color-fg-subtle: #6e7781;
        --color-canvas-default: #ffffff;
        --color-canvas-subtle: #f6f8fa;
        --color-border-default: #d0d7de;
        --color-border-muted: hsla(210,18%,87%,1);
        --color-neutral-muted: rgba(175,184,193,0.2);
        --color-accent-fg: #0969da;
        --color-accent-emphasis: #0969da;
        --color-attention-subtle: #fff8c5;
        --color-danger-fg: #cf222e;
      }
    }

    .markdown-body {
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
      margin: 0;
      color: var(--color-fg-default);
      background-color: var(--color-canvas-default);
      font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
      font-size: 16px;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .markdown-body .octicon {
      display: inline-block;
      fill: currentColor;
      vertical-align: text-bottom;
    }

    .markdown-body h1:hover .anchor .octicon-link:before,
    .markdown-body h2:hover .anchor .octicon-link:before,
    .markdown-body h3:hover .anchor .octicon-link:before,
    .markdown-body h4:hover .anchor .octicon-link:before,
    .markdown-body h5:hover .anchor .octicon-link:before,
    .markdown-body h6:hover .anchor .octicon-link:before {
      width: 16px;
      height: 16px;
      content: ' ';
      display: inline-block;
      background-color: currentColor;
    }

    .markdown-body details,
    .markdown-body figcaption,
    .markdown-body figure {
      display: block;
    }

    .markdown-body summary {
      display: list-item;
    }

    .markdown-body [hidden] {
      display: none !important;
    }

    .markdown-body a {
      background-color: transparent;
      color: var(--color-accent-fg);
      text-decoration: none;
    }

    .markdown-body a:active,
    .markdown-body a:hover {
      outline-width: 0;
    }

    .markdown-body abbr[title] {
      border-bottom: none;
      text-decoration: underline dotted;
    }

    .markdown-body b,
    .markdown-body strong {
      font-weight: 600;
    }

    .markdown-body dfn {
      font-style: italic;
    }

    .markdown-body h1 {
      margin: .67em 0;
      font-weight: 600;
      padding-bottom: .3em;
      font-size: 2em;
      border-bottom: 1px solid var(--color-border-muted);
    }

    .markdown-body mark {
      background-color: var(--color-attention-subtle);
      color: var(--color-text-primary);
    }

    .markdown-body small {
      font-size: 90%;
    }

    .markdown-body sub,
    .markdown-body sup {
      font-size: 75%;
      line-height: 0;
      position: relative;
      vertical-align: baseline;
    }

    .markdown-body sub {
      bottom: -0.25em;
    }

    .markdown-body sup {
      top: -0.5em;
    }

    .markdown-body img {
      border-style: none;
      max-width: 100%;
      box-sizing: content-box;
      background-color: var(--color-canvas-default);
    }

    .markdown-body code,
    .markdown-body kbd,
    .markdown-body pre,
    .markdown-body samp {
      font-family: monospace,monospace;
      font-size: 1em;
    }

    .markdown-body figure {
      margin: 1em 40px;
    }

    .markdown-body hr {
      box-sizing: content-box;
      overflow: hidden;
      background: transparent;
      border-bottom: 1px solid var(--color-border-muted);
      height: .25em;
      padding: 0;
      margin: 24px 0;
      background-color: var(--color-border-default);
      border: 0;
    }

    .markdown-body input {
      font: inherit;
      margin: 0;
      overflow: visible;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
    }

    .markdown-body [type=button],
    .markdown-body [type=reset],
    .markdown-body [type=submit] {
      -webkit-appearance: button;
    }

    .markdown-body [type=button]::-moz-focus-inner,
    .markdown-body [type=reset]::-moz-focus-inner,
    .markdown-body [type=submit]::-moz-focus-inner {
      border-style: none;
      padding: 0;
    }

    .markdown-body [type=button]:-moz-focusring,
    .markdown-body [type=reset]:-moz-focusring,
    .markdown-body [type=submit]:-moz-focusring {
      outline: 1px dotted ButtonText;
    }

    .markdown-body [type=checkbox],
    .markdown-body [type=radio] {
      box-sizing: border-box;
      padding: 0;
    }

    .markdown-body [type=number]::-webkit-inner-spin-button,
    .markdown-body [type=number]::-webkit-outer-spin-button {
      height: auto;
    }

    .markdown-body [type=search] {
      -webkit-appearance: textfield;
      outline-offset: -2px;
    }

    .markdown-body [type=search]::-webkit-search-cancel-button,
    .markdown-body [type=search]::-webkit-search-decoration {
      -webkit-appearance: none;
    }

    .markdown-body ::-webkit-input-placeholder {
      color: inherit;
      opacity: .54;
    }

    .markdown-body ::-webkit-file-upload-button {
      -webkit-appearance: button;
      font: inherit;
    }

    .markdown-body a:hover {
      text-decoration: underline;
    }

    .markdown-body hr::before {
      display: table;
      content: "";
    }

    .markdown-body hr::after {
      display: table;
      clear: both;
      content: "";
    }

    .markdown-body table {
      border-spacing: 0;
      border-collapse: collapse;
      display: block;
      width: max-content;
      max-width: 100%;
      overflow: auto;
    }

    .markdown-body td,
    .markdown-body th {
      padding: 0;
    }

    .markdown-body details summary {
      cursor: pointer;
    }

    .markdown-body details:not([open])>*:not(summary) {
      display: none !important;
    }

    .markdown-body kbd {
      display: inline-block;
      padding: 3px 5px;
      font: 11px ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace;
      line-height: 10px;
      color: var(--color-fg-default);
      vertical-align: middle;
      background-color: var(--color-canvas-subtle);
      border: solid 1px var(--color-neutral-muted);
      border-bottom-color: var(--color-neutral-muted);
      border-radius: 6px;
      box-shadow: inset 0 -1px 0 var(--color-neutral-muted);
    }

    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4,
    .markdown-body h5,
    .markdown-body h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }

    .markdown-body h2 {
      font-weight: 600;
      padding-bottom: .3em;
      font-size: 1.5em;
      border-bottom: 1px solid var(--color-border-muted);
    }

    .markdown-body h3 {
      font-weight: 600;
      font-size: 1.25em;
    }

    .markdown-body h4 {
      font-weight: 600;
      font-size: 1em;
    }

    .markdown-body h5 {
      font-weight: 600;
      font-size: .875em;
    }

    .markdown-body h6 {
      font-weight: 600;
      font-size: .85em;
      color: var(--color-fg-muted);
    }

    .markdown-body p {
      margin-top: 0;
      margin-bottom: 10px;
    }

    .markdown-body blockquote {
      margin: 0;
      padding: 0 1em;
      color: var(--color-fg-muted);
      border-left: .25em solid var(--color-border-default);
    }

    .markdown-body ul,
    .markdown-body ol {
      margin-top: 0;
      margin-bottom: 0;
      padding-left: 2em;
    }

    .markdown-body ol ol,
    .markdown-body ul ol {
      list-style-type: lower-roman;
    }

    .markdown-body ul ul ol,
    .markdown-body ul ol ol,
    .markdown-body ol ul ol,
    .markdown-body ol ol ol {
      list-style-type: lower-alpha;
    }

    .markdown-body dd {
      margin-left: 0;
    }

    .markdown-body tt,
    .markdown-body code {
      font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace;
      font-size: 12px;
    }

    .markdown-body pre {
      margin-top: 0;
      margin-bottom: 0;
      font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace;
      font-size: 12px;
      word-wrap: normal;
    }

    .markdown-body .octicon {
      display: inline-block;
      overflow: visible !important;
      vertical-align: text-bottom;
      fill: currentColor;
    }

    .markdown-body ::placeholder {
      color: var(--color-fg-subtle);
      opacity: 1;
    }

    .markdown-body input::-webkit-outer-spin-button,
    .markdown-body input::-webkit-inner-spin-button {
      margin: 0;
      -webkit-appearance: none;
      appearance: none;
    }

    .markdown-body .pl-c {
      color: var(--color-prettylights-syntax-comment);
    }

    .markdown-body .pl-c1,
    .markdown-body .pl-s .pl-v {
      color: var(--color-prettylights-syntax-constant);
    }

    .markdown-body .pl-e,
    .markdown-body .pl-en {
      color: var(--color-prettylights-syntax-entity);
    }

    .markdown-body .pl-smi,
    .markdown-body .pl-s .pl-s1 {
      color: var(--color-prettylights-syntax-storage-modifier-import);
    }

    .markdown-body .pl-ent {
      color: var(--color-prettylights-syntax-entity-tag);
    }

    .markdown-body .pl-k {
      color: var(--color-prettylights-syntax-keyword);
    }

    .markdown-body .pl-s,
    .markdown-body .pl-pds,
    .markdown-body .pl-s .pl-pse .pl-s1,
    .markdown-body .pl-sr,
    .markdown-body .pl-sr .pl-cce,
    .markdown-body .pl-sr .pl-sre,
    .markdown-body .pl-sr .pl-sra {
      color: var(--color-prettylights-syntax-string);
    }

    .markdown-body .pl-v,
    .markdown-body .pl-smw {
      color: var(--color-prettylights-syntax-variable);
    }

    .markdown-body .pl-bu {
      color: var(--color-prettylights-syntax-brackethighlighter-unmatched);
    }

    .markdown-body .pl-ii {
      color: var(--color-prettylights-syntax-invalid-illegal-text);
      background-color: var(--color-prettylights-syntax-invalid-illegal-bg);
    }

    .markdown-body .pl-c2 {
      color: var(--color-prettylights-syntax-carriage-return-text);
      background-color: var(--color-prettylights-syntax-carriage-return-bg);
    }

    .markdown-body .pl-sr .pl-cce {
      font-weight: bold;
      color: var(--color-prettylights-syntax-string-regexp);
    }

    .markdown-body .pl-ml {
      color: var(--color-prettylights-syntax-markup-list);
    }

    .markdown-body .pl-mh,
    .markdown-body .pl-mh .pl-en,
    .markdown-body .pl-ms {
      font-weight: bold;
      color: var(--color-prettylights-syntax-markup-heading);
    }

    .markdown-body .pl-mi {
      font-style: italic;
      color: var(--color-prettylights-syntax-markup-italic);
    }

    .markdown-body .pl-mb {
      font-weight: bold;
      color: var(--color-prettylights-syntax-markup-bold);
    }

    .markdown-body .pl-md {
      color: var(--color-prettylights-syntax-markup-deleted-text);
      background-color: var(--color-prettylights-syntax-markup-deleted-bg);
    }

    .markdown-body .pl-mi1 {
      color: var(--color-prettylights-syntax-markup-inserted-text);
      background-color: var(--color-prettylights-syntax-markup-inserted-bg);
    }

    .markdown-body .pl-mc {
      color: var(--color-prettylights-syntax-markup-changed-text);
      background-color: var(--color-prettylights-syntax-markup-changed-bg);
    }

    .markdown-body .pl-mi2 {
      color: var(--color-prettylights-syntax-markup-ignored-text);
      background-color: var(--color-prettylights-syntax-markup-ignored-bg);
    }

    .markdown-body .pl-mdr {
      font-weight: bold;
      color: var(--color-prettylights-syntax-meta-diff-range);
    }

    .markdown-body .pl-ba {
      color: var(--color-prettylights-syntax-brackethighlighter-angle);
    }

    .markdown-body .pl-sg {
      color: var(--color-prettylights-syntax-sublimelinter-gutter-mark);
    }

    .markdown-body .pl-corl {
      text-decoration: underline;
      color: var(--color-prettylights-syntax-constant-other-reference-link);
    }

    .markdown-body [data-catalyst] {
      display: block;
    }

    .markdown-body g-emoji {
      font-family: "Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
      font-size: 1em;
      font-style: normal !important;
      font-weight: 400;
      line-height: 1;
      vertical-align: -0.075em;
    }

    .markdown-body g-emoji img {
      width: 1em;
      height: 1em;
    }

    .markdown-body::before {
      display: table;
      content: "";
    }

    .markdown-body::after {
      display: table;
      clear: both;
      content: "";
    }

    .markdown-body>*:first-child {
      margin-top: 0 !important;
    }

    .markdown-body>*:last-child {
      margin-bottom: 0 !important;
    }

    .markdown-body a:not([href]) {
      color: inherit;
      text-decoration: none;
    }

    .markdown-body .absent {
      color: var(--color-danger-fg);
    }

    .markdown-body .anchor {
      float: left;
      padding-right: 4px;
      margin-left: -20px;
      line-height: 1;
    }

    .markdown-body .anchor:focus {
      outline: none;
    }

    .markdown-body p,
    .markdown-body blockquote,
    .markdown-body ul,
    .markdown-body ol,
    .markdown-body dl,
    .markdown-body table,
    .markdown-body pre,
    .markdown-body details {
      margin-top: 0;
      margin-bottom: 16px;
    }

    .markdown-body blockquote>:first-child {
      margin-top: 0;
    }

    .markdown-body blockquote>:last-child {
      margin-bottom: 0;
    }

    .markdown-body sup>a::before {
      content: "[";
    }

    .markdown-body sup>a::after {
      content: "]";
    }

    .markdown-body h1 .octicon-link,
    .markdown-body h2 .octicon-link,
    .markdown-body h3 .octicon-link,
    .markdown-body h4 .octicon-link,
    .markdown-body h5 .octicon-link,
    .markdown-body h6 .octicon-link {
      color: var(--color-fg-default);
      vertical-align: middle;
      visibility: hidden;
    }

    .markdown-body h1:hover .anchor,
    .markdown-body h2:hover .anchor,
    .markdown-body h3:hover .anchor,
    .markdown-body h4:hover .anchor,
    .markdown-body h5:hover .anchor,
    .markdown-body h6:hover .anchor {
      text-decoration: none;
    }

    .markdown-body h1:hover .anchor .octicon-link,
    .markdown-body h2:hover .anchor .octicon-link,
    .markdown-body h3:hover .anchor .octicon-link,
    .markdown-body h4:hover .anchor .octicon-link,
    .markdown-body h5:hover .anchor .octicon-link,
    .markdown-body h6:hover .anchor .octicon-link {
      visibility: visible;
    }

    .markdown-body h1 tt,
    .markdown-body h1 code,
    .markdown-body h2 tt,
    .markdown-body h2 code,
    .markdown-body h3 tt,
    .markdown-body h3 code,
    .markdown-body h4 tt,
    .markdown-body h4 code,
    .markdown-body h5 tt,
    .markdown-body h5 code,
    .markdown-body h6 tt,
    .markdown-body h6 code {
      padding: 0 .2em;
      font-size: inherit;
    }

    .markdown-body ul.no-list,
    .markdown-body ol.no-list {
      padding: 0;
      list-style-type: none;
    }

    .markdown-body ol[type="1"] {
      list-style-type: decimal;
    }

    .markdown-body ol[type=a] {
      list-style-type: lower-alpha;
    }

    .markdown-body ol[type=i] {
      list-style-type: lower-roman;
    }

    .markdown-body div>ol:not([type]) {
      list-style-type: decimal;
    }

    .markdown-body ul ul,
    .markdown-body ul ol,
    .markdown-body ol ol,
    .markdown-body ol ul {
      margin-top: 0;
      margin-bottom: 0;
    }

    .markdown-body li>p {
      margin-top: 16px;
    }

    .markdown-body li+li {
      margin-top: .25em;
    }

    .markdown-body dl {
      padding: 0;
    }

    .markdown-body dl dt {
      padding: 0;
      margin-top: 16px;
      font-size: 1em;
      font-style: italic;
      font-weight: 600;
    }

    .markdown-body dl dd {
      padding: 0 16px;
      margin-bottom: 16px;
    }

    .markdown-body table th {
      font-weight: 600;
    }

    .markdown-body table th,
    .markdown-body table td {
      padding: 6px 13px;
      border: 1px solid var(--color-border-default);
    }

    .markdown-body table tr {
      background-color: var(--color-canvas-default);
      border-top: 1px solid var(--color-border-muted);
    }

    .markdown-body table tr:nth-child(2n) {
      background-color: var(--color-canvas-subtle);
    }

    .markdown-body table img {
      background-color: transparent;
    }

    .markdown-body img[align=right] {
      padding-left: 20px;
    }

    .markdown-body img[align=left] {
      padding-right: 20px;
    }

    .markdown-body .emoji {
      max-width: none;
      vertical-align: text-top;
      background-color: transparent;
    }

    .markdown-body span.frame {
      display: block;
      overflow: hidden;
    }

    .markdown-body span.frame>span {
      display: block;
      float: left;
      width: auto;
      padding: 7px;
      margin: 13px 0 0;
      overflow: hidden;
      border: 1px solid var(--color-border-default);
    }

    .markdown-body span.frame span img {
      display: block;
      float: left;
    }

    .markdown-body span.frame span span {
      display: block;
      padding: 5px 0 0;
      clear: both;
      color: var(--color-fg-default);
    }

    .markdown-body span.align-center {
      display: block;
      overflow: hidden;
      clear: both;
    }

    .markdown-body span.align-center>span {
      display: block;
      margin: 13px auto 0;
      overflow: hidden;
      text-align: center;
    }

    .markdown-body span.align-center span img {
      margin: 0 auto;
      text-align: center;
    }

    .markdown-body span.align-right {
      display: block;
      overflow: hidden;
      clear: both;
    }

    .markdown-body span.align-right>span {
      display: block;
      margin: 13px 0 0;
      overflow: hidden;
      text-align: right;
    }

    .markdown-body span.align-right span img {
      margin: 0;
      text-align: right;
    }

    .markdown-body span.float-left {
      display: block;
      float: left;
      margin-right: 13px;
      overflow: hidden;
    }

    .markdown-body span.float-left span {
      margin: 13px 0 0;
    }

    .markdown-body span.float-right {
      display: block;
      float: right;
      margin-left: 13px;
      overflow: hidden;
    }

    .markdown-body span.float-right>span {
      display: block;
      margin: 13px auto 0;
      overflow: hidden;
      text-align: right;
    }

    .markdown-body code,
    .markdown-body tt {
      padding: .2em .4em;
      margin: 0;
      font-size: 85%;
      background-color: var(--color-neutral-muted);
      border-radius: 6px;
    }

    .markdown-body code br,
    .markdown-body tt br {
      display: none;
    }

    .markdown-body del code {
      text-decoration: inherit;
    }

    .markdown-body pre code {
      font-size: 100%;
    }

    .markdown-body pre>code {
      padding: 0;
      margin: 0;
      word-break: normal;
      white-space: pre;
      background: transparent;
      border: 0;
    }

    .markdown-body .highlight {
      margin-bottom: 16px;
    }

    .markdown-body .highlight pre {
      margin-bottom: 0;
      word-break: normal;
    }

    .markdown-body .highlight pre,
    .markdown-body pre {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: var(--color-canvas-subtle);
      border-radius: 6px;
    }

    .markdown-body pre code,
    .markdown-body pre tt {
      display: inline;
      max-width: auto;
      padding: 0;
      margin: 0;
      overflow: visible;
      line-height: inherit;
      word-wrap: normal;
      background-color: transparent;
      border: 0;
    }

    .markdown-body .csv-data td,
    .markdown-body .csv-data th {
      padding: 5px;
      overflow: hidden;
      font-size: 12px;
      line-height: 1;
      text-align: left;
      white-space: nowrap;
    }

    .markdown-body .csv-data .blob-num {
      padding: 10px 8px 9px;
      text-align: right;
      background: var(--color-canvas-default);
      border: 0;
    }

    .markdown-body .csv-data tr {
      border-top: 0;
    }

    .markdown-body .csv-data th {
      font-weight: 600;
      background: var(--color-canvas-subtle);
      border-top: 0;
    }

    .markdown-body .footnotes {
      font-size: 12px;
      color: var(--color-fg-muted);
      border-top: 1px solid var(--color-border-default);
    }

    .markdown-body .footnotes ol {
      padding-left: 16px;
    }

    .markdown-body .footnotes li {
      position: relative;
    }

    .markdown-body .footnotes li:target::before {
      position: absolute;
      top: -8px;
      right: -8px;
      bottom: -8px;
      left: -24px;
      pointer-events: none;
      content: "";
      border: 2px solid var(--color-accent-emphasis);
      border-radius: 6px;
    }

    .markdown-body .footnotes li:target {
      color: var(--color-fg-default);
    }

    .markdown-body .footnotes .data-footnote-backref g-emoji {
      font-family: monospace;
    }

    .markdown-body .task-list-item {
      list-style-type: none;
    }

    .markdown-body .task-list-item label {
      font-weight: 400;
    }

    .markdown-body .task-list-item.enabled label {
      cursor: pointer;
    }

    .markdown-body .task-list-item+.task-list-item {
      margin-top: 3px;
    }

    .markdown-body .task-list-item .handle {
      display: none;
    }

    .markdown-body .task-list-item-checkbox {
      margin: 0 .2em .25em -1.6em;
      vertical-align: middle;
    }

    .markdown-body .contains-task-list:dir(rtl) .task-list-item-checkbox {
      margin: 0 -1.6em .25em .2em;
    }

    .markdown-body ::-webkit-calendar-picker-indicator {
      filter: invert(50%);
    }`;
    popup.document.body.classList.add('markdown-body');
    popup.document.close();

    const root = ReactDOM.createRoot(popup.document.getElementById('ai-code-root'));
    root.render(<ProblemPopup
      problemData={problemData}
      solveData={solveData}
      onRenderComplete={() => addLanguageToCodeBlocks(popup.document)}
    />);
  } else {
    // console.error('Popup blocked');
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
    // console.log('AI 코드 리뷰: 코드 리뷰 버튼이 추가되었습니다.');
  } else {
    // console.log('AI 코드 리뷰: 문제 정보를 찾을 수 없습니다.');
  }
}

// 공통 로직 실행
document.addEventListener('DOMContentLoaded', async () => {
  // console.log('AI 코드 리뷰: AI 코드 리뷰가 시작되었습니다.');
  await addButton();
  if (/https:\/\/www\.acmicpc\.net\/problem\/\d+/.test(window.location.href)) {
    // console.log('AI 코드 리뷰: 새 문제가 감지되었습니다.');
    await saveProblemDetailsToLocal();
  } else if (/^https:\/\/www\.acmicpc\.net\/submit\/\d+(\/\d+)?$/.test(window.location.href)) {
    // console.log('AI 코드 리뷰: 문제 풀이를 시작합니다.')
    await saveSolveDetailsToLocal();
  }
});
