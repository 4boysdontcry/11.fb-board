/*************** 글로벌 설정 *****************/
var auth = firebase.auth();	//firebase의 auth(인증)모듈을 불러온다.
var googleAuth = new firebase.auth.GoogleAuthProvider(); //구글로그인 모듈을 불러온다.
var db = firebase.database();
var talkRef = db.ref('root/talk');
var roomRef = db.ref('root/room');
var talkKey = null;

var $listWrapper = $('.list-wrapper');

var yoil = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
var prevDate = '';


/*************** Auth *****************/
auth.onAuthStateChanged(onChangeAuth);
$('.bt-login').click(onLoginGoogle);
$('.bt-logout').click(onLogOut);

function onChangeAuth(r) {
	console.log(r);
	user = r;
	if(user) {
		$('.header-wrapper .photo img').attr('src', user.photoURL);
		$('.header-wrapper .info-wrap').css('display', 'flex');
		$('.header-wrapper .logo i').css('display', 'none');
		$('.room-wrapper').css('display', 'flex');
		$('.login-wrapper').css('display', 'none');
		$('.room-wrapper').find('input[name="writer"]').val(user.displayName);
		$('.bt-login').css('display', 'none');
		$('.bt-logout').css('display', 'flex');
	}
	else {
		$('.header-wrapper .photo img').attr('src', '//via.placeholder.com/1x1/333');
		$('.header-wrapper .info-wrap').css('display', 'none');
		$('.header-wrapper .logo i').css('display', 'inline-block');
		$('.room-wrapper').css('display', 'none');
		$('.room-wrapper').find('input[name="writer"]').val('');
		$('.login-wrapper').css('display', 'flex');
		$('.bt-login').css('display', 'flex');
		$('.bt-logout').css('display', 'none');
	}
}

function onLogOut() {
	auth.signOut();
}

function onLoginGoogle() {
	auth.signInWithPopup(googleAuth);
}



/*************** firebase event *****************/
roomRef.on('child_added', onRoomAdded);
roomRef.on('child_changed', onRoomChanged);
roomRef.on('child_removed', onRoomRemoved);



/*************** talk *****************/
function onTalkAdded(r) {
	genTalk(r.key, r.val());
}

function genTalk(k, v) {
	var content = v.content.replace(URLPattern, URLReplace);
	var html = '';
	if(prevDate !== moment(v.createdAt).format('YYYYMMDD')) {
		prevDate = moment(v.createdAt).format('YYYYMMDD'); //20210520
		html += '<div class="line"><span>';
		html += moment(v.createdAt).format('YYYY년 M월 D일 ') + yoil[new Date(v.createdAt).getDay()]
		html += '<span></div>';
	}
	html += '<div class="talk-wrapper '+ (v.uid === user.uid ? 'me' : '')+'" id="'+k+'">';
	if(v.uid !== user.uid) {
		html += '<div class="icon">';
		html += '<img src="'+v.photo+'" alt="icon" class="w-100">';
		html += '</div>';
	}
	html += '<div class="talk-wrap">';
	html += '<div class="writer">'+v.name+'</div>';
	html += '<div class="content-wrap">';
	html += '<i class="fa fa-caret-left left"></i>';
	html += '<i class="fa fa-caret-right right"></i>';
	html += '<div class="content">'+content+'</div>';
	html += '<div class="date">'+moment(v.createdAt).format('a hh:mm')+'</div>';
	html += '</div>';
	html += '</div>';
	html += '</div>';
	$listWrapper.append(html);
	$listWrapper.scrollTop($listWrapper[0].scrollHeight);
}

function onSubmit(f) {
	if($(f.content).val().trim() !== '') {
		console.log(new Date());
		var data = {
			uid: user.uid,
			photo: user.photoURL,
			name: user.displayName,
			content: $(f.content).val(),
			createdAt: new Date().getTime()
		}
		talkRef.child(talkKey).push(data);
		$(f.content).val('');
	}
	$(f.content).focus();
	return false;
}

function onChatOut(){
	$('.room-wrapper').css('display', 'flex');
	$('.chat-wrapper').css('display', 'none');
}

/******************** room ***********************/
function onRoomSubmit(f) {
	if(f.name.value.trim() === '') {
		alert('방제목을 입력하세요.');
		f.name.focus();
		return false;
	}
	if(f.writer.value.trim() === '') {
		alert('개설자를 입력하세요.');
		f.writer.focus();
		return false;
	}
	var data = { name: f.name.value, writer: f.writer.value, roompw: f.roompw.value }
	if(f.key && f.key.value) { // 수정
		data.updatedAt = new Date().getTime();
		if(f.roompw.value.trim() !== '') data.roompw.value = f.roompw.value;
		roomRef.child(f.key.value).update(data);
		alert('방 정보가 변경되었습니다.');
	}
	else { // 신규등록
		data.rid = uuidv4();
		data.uid = user.uid;
		data.createdAt = new Date().getTime();
		roomRef.push(data);
		f.name.value = '';
		f.roompw.value = '';
	}
	return false;
}

function onRoomDelete(el){
	if(confirm('정말로 삭제하시겠습니까? 삭제하면 대화내용도 함께 삭제됩니다.')){
		var key = el.form.key.value;
		roomRef.child(key).remove();		// firebase에서 삭제
		alert('삭제되었습니다.');
	}
}

function onRoomEnter(f) {
	var key = f.key.value;
	roomRef.child(key).once('value')
	.then(function(r) {
		if(r.val().roompw !== '') { // 비공개방
			if(r.val().roompw === f.roompw.value.trim()) { // 패스워드 일치
				showTalk(r.val().rid);
				f.roompw.value = '';
			}
			else { // 패스위드 불일치
				alert('패스워드가 일치하지 않습니다.');
				f.roompw.value = '';
				f.roompw.focus();
			}
		}
		else { // 공개방
			showTalk(r.val().rid);
		}
	})
	.catch(function(err) { 
		f.roompw.value = '';
		console.log(err) 
	});
	
	return false;
}

function onRoomAdded(v) {
	genRoom(v.key, v.val());
}

function onRoomChanged(v) {
	var html = $(genRoom(v.key, v.val(), true)).html();
	$('#'+v.key).html(html);
	$('#'+v.key).removeClass('secure');
	if(v.val().roompw != '') $('#'+v.key).addClass('secure')
}

function onRoomRemoved(v) {
	$('#'+v.key).remove();		// jQuery에서 삭제
}

function genRoom(k, v, isChange) {
	var html = '';
	html += '<div class="room-wrapper">';
	html += '<div class="room-wrap '+(v.roompw !== '' ? 'secure' : '')+'" id="'+k+'">';
	html += '<div class="title-wrap"> ';
	html += '<h3 class="name">'+v.name+'</h3>';
	if(user.uid === v.uid){
		html += '<button class="btn btn-sm btn-success bt-modi">';
		html += '<i class="bt-update fa fa-save"></i> 수정';
		html += '</button> ';
	}
	html += '</div> ';
	html += '<h4 class="writer">'+v.writer+'</h4>';
	html += '<div class="date mb-4">개설: '+moment(v.createdAt).format('YYYY-MM-DD')+'</div>';
	html += '<form class="enter-wrap form-inline" onsubmit="return onRoomEnter(this);">';
	if(v.roompw) 
	html += '<input type="password" name="roompw" class="form-control" placeholder="비밀번호">&nbsp;';
	html += '<input type="hidden" name="key" value="'+k+'"">';
	html += '<button class="btn btn-primary">방 입장</button>';
	html += '</form>';
	html += '</div>';
	html += '</div>';
	if(isChange) return html;
	else $('.room-wrap.create').after(html);
			}

		function genModi(){
			$('.room-wrapper').css('background-color', 'rgba(0, 0, 0, .7)')
			
		}
	
	
function showTalk(rid) {
	talkKey = rid;
	$('.room-wrapper').css('display', 'none');
	$('.chat-wrapper .list-wrapper').empty();
	$('.chat-wrapper').css('display', 'flex');
	$('.chat-wrapper .create-wrapper img').attr('src', user.photoURL);
	$('.chat-wrapper .create-wrapper input[name="writer"]').val(user.displayName);
	talkRef.child(talkKey).on('child_added', onTalkAdded);
}