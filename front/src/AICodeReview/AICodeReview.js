import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
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

/**
 * 문제 내용을 가져오는 함수
 * Fetch를 사용하여 정보를 구하는 함수로 다음 정보를 확인합니다.
 *   - 문제 번호: problemId
 *   - 문제 제목: problemTitle
 *   - 문제 설명: problemDescription
 *   - 문제 입력 예시: problemInput
 *   - 문제 출력 예시: problemOutput
 */
async function getProblemDetails() {
  const problemId = document.getElementsByTagName('title')[0].textContent.split(':')[0].replace(/[^0-9]/, '');
  const problemTitle = unescapeHtml(document.getElementById('problem_title')?.innerHTML.trim() || 'No title available.');
  const problemDescription = unescapeHtml(document.getElementById('problem_description')?.innerHTML.trim() || 'No description available.');
  const problemInput = unescapeHtml(document.getElementById('problem_input')?.innerHTML.trim() || 'Empty');
  const problemOutput = unescapeHtml(document.getElementById('problem_output')?.innerHTML.trim() || 'Empty');
  if (problemId && problemDescription) {
    console.log(`AI 코드 리뷰: 문제 내용을 조회합니다.`);
    return { problemId, problemTitle, problemDescription, problemInput, problemOutput };
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
 *   - 제출 코드: solveCode
 */
async function getSolveDetails() {
  const solveId = document.getElementsByTagName('title')[0].textContent.split(':')[0].replace(/[^0-9]/, '');
  const solveCode = document.querySelector('.cm-variable').innerHTML;
  if (solveId && solveCode) {
    console.log('AI 코드 리뷰: 제출 코드을 조회합니다.');
    return { solveId, solveCode };
  }
  return {};
}

// sessionStorage에 solveData 저장
async function saveSolveDetailsToLocal() {
  const submitBtn = document.querySelector('#submit_button');
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
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
  if (problemData.problemId === solveData.solveId) {
    return (
      <div className="problem-popup">
        <div className="problem-popup-content">
          <h2>Problem Title: {problemData.problemTitle}</h2>
          <h3>Problem Description</h3>
          <div dangerouslySetInnerHTML={{ __html: problemData.problemDescription }}></div>
          <h3>Input</h3>
          <div dangerouslySetInnerHTML={{ __html: problemData.problemInput }}></div>
          <h3>Output</h3>
          <div dangerouslySetInnerHTML={{ __html: problemData.problemOutput }}></div>
          <h3>My Code</h3>
          <pre>{solveData.solveCode}</pre>
        </div>
      </div>
    );
  } else {
    return (
      <h2>문제 내용을 다시 확인해주세요.</h2>
    )
  }
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
  const problemData = await loadProblemDetailsFromLocal();
  const solveData = await loadSolveDetailsFromLocal();
  const problemMenu = document.querySelector('.problem-menu');
  if (problemMenu) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.id = 'ai-review-button';
    a.textContent = 'AI 코드 리뷰';
    a.href = '#';
    a.onclick = async (event) => {
      event.preventDefault();
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
