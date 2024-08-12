/**
 * api.js
 *
 * 이 파일은 외부 API와의 통신을 처리합니다.
 */

/**
 * solved.ac API를 호출하여 문제 정보를 가져옵니다.
 * @param {number} problemId - 문제 ID
 * @returns {Promise<Object>} 문제 정보
 */

export async function solvedApiCall(problemId) {
    const response = await fetch(`https://solved.ac/api/v3/problem/show?problemId=${problemId}`);
    return response.json();
}