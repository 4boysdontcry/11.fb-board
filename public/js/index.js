/* ****************** 글로벌 설정 ******************** */
var auth = firebase.auth();     // firebase의 auth(인증)모듈을 불러온다.
var googleAuth = new firebase.auth.GoogleAuthProvider();        // firebase에서 제공하는 구글 로그인 모듈을 불러온다.
var user = null;


/* ****************** 사용자 함수 ******************** */



/* ****************** 이벤트 등록 ******************** */
auth.onAuthStateChanged(onChangeAuth);

$('.bt-login-google').click(onLoginGoogle);
$('.bt-logout').click(onLogOut);


/* ****************** 이벤트 콜백 ******************** */
function onChangeAuth(r){
    user = r;
    console.log(user);
}

function onLogOut(){
    auth.signOut();
}

function onLoginGoogle(){
    auth.signInWithPopup(googleAuth);
}



