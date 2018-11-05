import "@babel/polyfill"; // 이 라인을 지우지 말아주세요!

const templates = {
  loginForm: document.querySelector('#login-form').content
}

const rootEl = document.querySelector('.root')

function drawLoginForm() {
 // 1.템플릿 복사하기
const fragment = document.importNode(templates.loginForm, true)

 // 2. 내용 채우고, 이벤트 리스너 등록하기
 const loginFormEl = fragment.querySelector('.login-form')

 loginFormEl.addEventListener('submit', async e => {
   alert('로그인 요청 전송')
   e.preventDefault()
 })
 //개발할때는 그려지는 것부터 확인한 뒤에 기능을 붙여라 !

 // 3. 문서내부에 삽입하기
 rootEl.appendChild(fragment)
}

drawLoginForm()
