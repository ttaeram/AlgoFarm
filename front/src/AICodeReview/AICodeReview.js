import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './AICodeReview.css';

/**
 * 이미지 태그의 경로를 절대 경로로 전환합니다.
 */
function convertImageTagAbsoluteURL() {
  const images = document.getElementsByTagName('img');
  Array.from(images, (img) => {
    img.setAttribute('src', img.currentSrc);
  });
}

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
 * 문제 설명, 예시 입력, 예시 출력을 가져오는 함수
 * Fetch를 사용하여 정보를 구하는 함수로 다음 정보를 확인합니다.
 *   - 문제 번호: problemId
 *   - 문제 제목: problemTitle
 *   - 문제 설명: problemDescription
 *   - 문제 입력 예시: problemInput
 *   - 문제 출력 예시: problemOutput
 */
async function getProblemDetails() {
  convertImageTagAbsoluteURL(document.getElementById('problem_description')); // 이미지에 상대 경로가 있을 수 있으므로 이미지 경로를 절대 경로로 전환 합니다.
  const problemId = document.getElementsByTagName('title')[0].textContent.split(':')[0].replace(/[^0-9]/, '');
  const problemTitle = unescapeHtml(document.getElementById('problem_title')?.innerHTML.trim() || 'No title available.');
  const problemDescription = unescapeHtml(document.getElementById('problem_description')?.innerHTML.trim() || 'No description available.');
  const problemInput = unescapeHtml(document.getElementById('problem_input')?.innerHTML.trim() || 'Empty');
  const problemOutput = unescapeHtml(document.getElementById('problem_output')?.innerHTML.trim() || 'Empty');
  if (problemId && problemDescription) {
    console.log(`AI 코드 리뷰: ${problemId}번 문제 내용을 저장합니다.`);
    return { problemId, problemTitle, problemDescription, problemInput, problemOutput };
  }
  return {};
}

// chrome.storage.local에 problemData 저장
async function saveProblemDetailsToLocal() {
  const problemData = await getProblemDetails();
  return new Promise((resolve) => {
    chrome.storage.local.set({ problemData }, () => {
      console.log('AI 코드 리뷰: 로컬 스토리지에 갱신된 문제 내용을 갱신합니다.');
      resolve();
    });
  });
}

// chrome.storage.local에서 problemData 로드
async function loadProblemDetailsFromLocal() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['problemData'], (result) => {
      if (result.problemData) {
        console.log('AI 코드 리뷰: 로컬 스토리지에서 문제 내용 불러오기에 성공했습니다.');
        resolve(result.problemData);
      } else {
        console.log('AI 코드 리뷰: 로컬 스토리지에서 문제 내용 불러오기에 실패했습니다.');
        resolve(null);
      }
    });
  });
}

// 문제 데이터를 가져와서 팝업 화면에 표시하는 컴포넌트
const ProblemPopup = ({ problemData }) => {
  return (
    <div className="problem-popup">
      <div className="problem-popup-content">
        <h2>Problem Title: {problemData.problemTitle}</h2>
        <h3>Problem Description</h3>
        <p>{problemData.problemDescription}</p>
        <h3>Input</h3>
        <p>{problemData.problemInput}</p>
        <h3>Output</h3>
        <p>{problemData.problemOutput}</p>
      </div>
    </div>
  );
};

// React 컴포넌트를 렌더링하는 함수
function renderOverlay(problemData) {
  const popup = window.open('', 'AI Code Review', 'width=600,height=800');
  if (popup) {
    popup.document.write('<div id="ai-code-root"></div>');
    popup.document.write('<link rel="stylesheet" href="' + chrome.runtime.getURL('AICodeReview.css') + '">');
    popup.document.close();
    const root = ReactDOM.createRoot(popup.document.getElementById('ai-code-root'));
    root.render(<ProblemPopup problemData={problemData} />);
  } else {
    console.error('Popup blocked');
  }
}

// 페이지 로드 후 "AI 코드 리뷰" 버튼 추가
async function addButton() {
  const problemData = await loadProblemDetailsFromLocal();
  const problemMenu = document.querySelector('.problem-menu');
  if (problemMenu) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.id = 'ai-review-button';
    a.textContent = 'AI 코드 리뷰';
    a.href = '#';
    a.onclick = async (event) => {
      event.preventDefault();
      renderOverlay(problemData);
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
  if (/https:\/\/www\.acmicpc\.net\/problem\/\d+/.test(window.location.href)) {
    console.log('AI 코드 리뷰: 새 문제가 감지되었습니다.')
    await saveProblemDetailsToLocal();
  }
  await addButton()
});
