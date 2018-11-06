import "@babel/polyfill"; // 이 라인을 지우지 말아주세요!
import axios from 'axios'
//npm install axios 해서 npm install로 설치하고 탑내는 import로 탑재!

const api = axios.create({
  baseURL: 'https://courageous-krill.glitch.me/'
})


// Axios Interceptor - 그때그때 다른 설정 사용하기
// axios에는 매번 요청이 일어나기 직전에 **설정 객체를 가로채서** 원하는대로 편집할 수 있는 기능이 있습니다.
api.interceptors.request.use(function (config) {
  // localStorage에 token이 있으면 요청에 토큰을 포함시키고, 없으면 토큰을 포함시키지 않는 코드
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
});


const templates = {
  loginForm: document.querySelector('#login-form').content,
  todoList: document.querySelector('#todo-list').content,
  todoItem: document.querySelector('#todo-item').content,
}

const rootEl = document.querySelector('.root')

function drawLoginForm() {
 // 1.템플릿 복사하기
const fragment = document.importNode(templates.loginForm, true)

 // 2. 내용 채우고, 이벤트 리스너 등록하기
 const loginFormEl = fragment.querySelector('.login-form')

 loginFormEl.addEventListener('submit', async e => {
   e.preventDefault()
   //e:이벤트객체
   //e.target: 이벤트를 실제로 일으킨 요소 객체(여기서는 loginFormEl)
   //e.target.elements: 폼 내부에 들어있는 요소 객체를 편하게 가져올 수 있는 특이한 객체
   //e.target.elements.username: name 어트리뷰트에 username이라고 지정되어있는 input요소 객체
   //.value : 사용자가 input 태그에 입력한 값
   const username = e.target.elements.username.value
   const password = e.target.elements.password.value
   const res = await api.post('/users/login', {
     username,  //username: username
     password   //password: password
   })
   localStorage.setItem('token', res.data.token)
   drawTodoList()
 })
 //개발할때는 그려지는 것부터 확인한 뒤에 기능을 붙여라 !

 // 3. 문서내부에 삽입하기
 rootEl.textContent = ''
 //로그아웃 버튼을 누르면 그 위의 모든 것이 싹 없어지고 다시 로그인 폼만 띵! 나와욧 !
 rootEl.appendChild(fragment)
}

//할일 목록 그려주기
//작업할때는 그리는거부터 해주기 ! 그다음에 통신을 해야해요!
async function drawTodoList() {
  //할일들을 추가하는대로 나타내어준다.
 const res = await api.get('/todos')
 const list = res.data

 //1. 템플릿 복사하기
 const fragment = document.importNode(templates.todoList, true)

 //2. 내용 채우고 이벤트 리스너 등록하기
 const todoListEl = fragment.querySelector('.todo-list')
 const todoFormEl = fragment.querySelector('.todo-form')
 const logoutEl = fragment.querySelector('.logout')

 logoutEl.addEventListener('click', e => {
   //sync 없는 이유는 서버에 요청 보낼것이 하나도 없기 때문에....
   //로그아웃 절차
   //1. 토큰 삭제
   localStorage.removeItem('token')
   //2. 로그인 폼 보여주기
   drawLoginForm()
 })

 todoFormEl.addEventListener('submit', async e => {
   e.preventDefault()
   const body = e.target.elements.body.value
   const res = await api.post('/todos', {
     //응답이 왔을때 채워지는 통 을 저장해주기.
     body,
     complete: false
   })
   if (res.status === 201) {
     //drawTodoList()
   }
   //응답이 잘 왔으면 굳이 status 참고 안해도 된다. 삭제버튼 구현 할때 잘 참고하기
 })

 list.forEach(todoItem => {
   //todoItem을 복사해서 todoList에 넣어줄거야.

   //1. 템플릿 복사하기
   const fragment = document.importNode(templates.todoItem, true)

   //2. 내용 채우고 이벤트 리스너 등록하기
   const bodyEl = fragment.querySelector('.body')

   //삭제숙제
   const deleteEl= fragment.querySelector('.delete')
   const completeEl = fragment.querySelector('.complete')

   if(todoItem.complete) {
     //todoItem의  complete가 true라면..
     completeEl.setAttribute('checked', '')
   }
   //Attribute 이름만 있고 값이 없는 Arribute를 Boolean Attibute
   //content editable, disable 찾아볼것

   deleteEl.addEventListener('click', async e => {
     //1. 삭제요청보내기
     //2. 성공시 할일 목록 다시 그리기
     //removeChild로 하면 서버에 있는 원본은 없어지지 않습니당 ! 조심해야행
     await api.delete('/todos/' + todoItem.id)
     //성공시 할일 목록 다시 그리기
     drawTodoList()
   })

   bodyEl.textContent = todoItem.body

   completeEl.addEventListener('click', async e=> {
       e.preventDefault()
       //체크박스에도 preventDefault를 넣을수 있어요.
       await api.patch('/todos/' + todoItem.id, {
         complete: !todoItem.complete
         //true를 false로, flase를 true
       })
       drawTodoList()
   })


   //3. 문서 내부에 삽입하기
   todoListEl.appendChild(fragment)

 })


 //3. 문서 내부에 삽입하기
rootEl.textContent = ''
//rootEl을 비워준다.
rootEl.appendChild(fragment)
}

//ul위에 폼이 있어가지고 할일테스트를 입력해서 엔터치면 다시 할일목록을 가져오는 코드


//만약 로그인을 한 상태라면 바로 할일 목록을 보여주고
if (localStorage.getItem('token')){
  drawTodoList()
} else {
  drawLoginForm()
  //아니라면 로그인폼을 보여준다.
}


//삭제버튼 후 이페이지를 다시한번 그리기
