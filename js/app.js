// Import the functions you need from the SDKs you need
import firebaseConfig from "./firebaseApikey.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, push, set, update, remove, onChildAdded, onChildChanged, onChildRemoved, onValue } 
from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);
const dbRef = ref(db,"chat");

// 現在日時取得
function GetDateNowFormat(){
  let date = new Date();
  return date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' +('0' + date.getDate()).slice(-2) + ' ' +  ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2) + '.' + date.getMilliseconds();
}

// コメントチェック
function CheckComment(comment){
  let reComment;
  reComment = comment.replace('fuck', '****');
  reComment = comment.replace('FUCK', '****');
  return reComment;
}

// チャット送信ボタン押下
$("#submit_btn").on("click",function() {
  let dateFormat = GetDateNowFormat();
  // アイコン画像
  let selected = document.getElementById('icon_select').value;
  // アイコン画像（ファイル入力）
  let input_file = document.querySelector('[name=input_file]');
  let upload_file_url;
  if(input_file.value != "") {
    upload_file_url = URL.createObjectURL(input_file.files[0]);
  } else if (selected == "1") {
    upload_file_url = "img/penguin.png";
  } else if (selected == "2") {
    upload_file_url = "img/azarashi.png";
  } else {
    upload_file_url = "img/noimage.jpeg";
  }
  // ユーザ名
  let name;
  if ($("#userName").val() == "") {
    name = "匿名";
  } else {
    name = $("#userName").val();
  }
  // コメント
  let re_comment = CheckComment($("#comment").val())
  const msg = {
      date: dateFormat,
      editDate: "",
      userName: name,
      comment: re_comment,
      imageUrl: upload_file_url,
      goodNumber: 0
  }
  const newPostRef = push(dbRef);
  set(newPostRef, msg);
});

// サイコロを振るボタン押下
$("#dice_btn").on("click",function() {
  let dateFormat = GetDateNowFormat();
  // アイコン画像
  let selected = document.getElementById('icon_select').value;
  // アイコン画像（ファイル入力）
  let input_file = document.querySelector('[name=input_file]');
  let upload_file_url;
  if(input_file.value != "") {
    upload_file_url = URL.createObjectURL(input_file.files[0]);
  } else if (selected == "1") {
    upload_file_url = "img/penguin.png";
  } else if (selected == "2") {
    upload_file_url = "img/azarashi.png";
  } else {
    upload_file_url = "img/noimage.jpeg";
  }
  // ユーザ名
  let name;
  if ($("#userName").val() == "") {
    name = "匿名";
  } else {
    name = $("#userName").val();
  }
  // サイコロ（1d100）
  let dice = Math.floor( Math.random() * 100) + 1;
  const msg = {
      date: dateFormat,
      editDate: "",
      userName: name,
      comment: "1d100 > " + dice,
      imageUrl: upload_file_url,
      goodNumber: 0
  }
  const newPostRef = push(dbRef);
  set(newPostRef, msg);
});

// いいねボタン押下
$('#output').on("click", ".updateGood", function(){
  const key = $(this).attr("data-key");
  let number;
  onValue(dbRef, function(snapshots){
    snapshots.forEach(function(snapshot){
      let data = snapshot.val();
      if (snapshot.key == key) {
        number = Number(data.goodNumber);
      }
    });
  });
  update(ref(db, "chat/" + key), {
    goodNumber: number + 1
  });
  $("#" + key + '_updateGood').text(String(number));
});

onChildAdded(dbRef, function(data){   
  const msg  = data.val();
  const key  = data.key;
  let h = '<div class="chat_box" id="' + key + '">';
      h += '<div class="profile_area">';
      h += '<img src="' + msg.imageUrl + '" class="profile_img">';
      h += '<div class="userName_txt">';
      h += msg.userName;
      h += '</div>';
      h += '</div>';
      h += '<div class="fukidashi_area">';
      h += '<div class="arrow_box" contentEditable="true" id="' + key + '_update">';
      h += msg.comment;
      h += '</div>';
      h += '<div class="time_txt" id="' + key + '_updateDt">';
      h += msg.date;
      h += '</div>';
      h += '<div class="good_area">';
      h += '<img src="img/good.png" class="good_icon_img updateGood" data-key="' + key + '">';
      h += '<div id="' + key + '_updateGood">';
      h += msg.goodNumber;
      h += '</div>';
      h += '</div>';
      h += '</div>';
      h += '<div class="icon_area">';
      h += '<img src="img/up.png" data-key="' + key + '" class="icon_img update">';
      h += '<img src="img/trash.png" data-key="' + key + '" class="icon_img remove">';
      h += '</div>';
      h += '</div>';
      $("#output").append(h);
});

// 削除イベント
$('#output').on("click", ".remove", function(){
  const key = $(this).attr("data-key");
  const remove_item = ref(db, "chat/" + key);
  remove(remove_item);
});

// 更新イベント
$('#output').on("click", ".update", function(){
  let dateFormat = GetDateNowFormat();
  const key = $(this).attr("data-key");
  update(ref(db, "chat/" + key), {
    comment: $("#" + key + '_update').html(),
    editDate: dateFormat
  });
  $("#" + key + '_updateDt').text(dateFormat + '（編集済み）');
});

// 削除処理
onChildRemoved(dbRef, (data) => {
  $("#" + data.key).remove();
});

// 更新処理
onChildChanged(dbRef, (data) => {
  $("#" + key + '_update').html(data.val().text);
  $("#" + key + '_update').fadeOut(800).fadeIn(800);
});