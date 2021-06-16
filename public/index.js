/*
 * @Description:
 * @Autor: Liou
 * @Date: 2021-06-14 19:36:50
 * @LastEditors: Liou
 * @LastEditTime: 2021-06-16 20:40:58
 */

let user = null,//当前用户
    senderUser = null,//与之私聊的用户
    socket = null,
    isPrivateChat = false,
    targetId = ''//私聊的用户Id

function $(el, isSelectAll = false) {
    return isSelectAll ? document.querySelectorAll(el) : document.querySelector(el)
}

//上传头像
$("#file").addEventListener("change", () => {
    let file = document.getElementById("file").files[0];
    const r = new FileReader();
    r.onload = () => {
        img.src = r.result;
        img.setAttribute("is-null", "false");
    }
    r.readAsDataURL(file)
})


//进入聊天室
$(".enter").addEventListener("click", () => {
    if (img.getAttribute("is-null") === "true" || !$("#nickName").value.trim()) return alert("头像和昵称不能为空!");
    $(".panel").classList.add("enter_chat");

    socket = io();
    //登录
    socket.emit("login", { avatar: img.src, nickName: $("#nickName").value });

    //服务器端广播的内容
    socket.on("notify", data => console.log(data))

    //保存用户
    socket.on("saveUser", data => user = data)

    //渲染头像
    socket.on("renderAvater", async data => {
        await init(data);
        $(".avatar_list_item img", true).forEach(img => {
            img.onclick = () => {
                const { id, nickname } = img.dataset;
                //私聊
                if (id === user.id) return alert("不能和自己私聊！");
                //取消小红点
                const span = img.nextElementSibling;
                span.className = "";
                span.innerHTML = ''

                isPrivateChat = true;
                targetId = id;

                $(".chat_private").classList.add("active");
                $('.chat_private_title').innerHTML =
                    ` <span class="chat_title">与<span class="target_name">${nickname}</span>私聊</span>
                      <span class="chat_close">x</span>`

                //取消之前的监听
                $(".sendBtn").removeEventListener("click", sendMessage);
                $(".sendBtn").addEventListener("click", sendMessage);

                //监听关闭私聊
                $(".chat_close").onclick = () => {
                    isPrivateChat = false
                    $(".chat_private").classList.remove("active");
                };
            }


        })
    })

    $(".sendBtn").addEventListener("click", sendMessage)

    //监听群发消息
    socket.on("broadMessage", data => {
        reanderChat(data.message, data.user)
    })


    //监听私聊
    socket.on("privateChat", data => {
        const { actionUser, message } = data;
        const { avatar, nickName, id } = actionUser;
        senderUser = actionUser;
        //渲染聊天界面
        const html = `<div class="chat_list_item">
                <div class="avatar_info">
                    <img src=${avatar}
                        alt="">
                </div>
                <div class="chat_info">
                    <div class="create_time">${nickName}</div>
                    <div class="message">
                        ${message}
                    </div>
                   
                </div>
            </div>`
        $(".chat_private .chat_list").insertAdjacentHTML("beforeend", html);

        //设置未读小红点
        document.querySelectorAll(".avatar_list_item img").forEach(img => {
            if (img.dataset.id === id) {
                const span = img.nextElementSibling;
                span.className = "chat_badge";
                let num = +(span.innerHTML);
                span.innerHTML = ++num
            }
        })
    })
})



//初始化头像列表
async function init(data) {
    let html = ''
    data.forEach(u => {
        const { id, nickName, avatar } = u;
        html +=
            `<div class="avatar_list_item ">
                <img data-id=${id} data-nickName=${nickName} src=${avatar}>
                <span ></span>
             </div>`
    })

    $(".avatar_list").innerHTML = html
}

//渲染内容
function reanderChat(message, targetUser) {
    const { avatar, id, nickName } = targetUser

    if (id !== user.id) {
        const html = `<div class="chat_list_item">
                <div class="avatar_info">
                    <img src=${avatar}
                        alt="">
                </div>
                <div class="chat_info">
                    <div class="create_time">${nickName}</div>
                    <div class="message">
                        ${message}
                    </div>
                   
                </div>
            </div>`
        $(".chat_more .chat_list").insertAdjacentHTML("beforeend", html)
    } else {
        const html = `<div class="chat_list_item chat_list_self">
                <div class="avatar_info">
                    <img src=${avatar}
                        alt="">
                </div>
                <div class="chat_info">
                    <div class="create_time">${nickName}</div>
                    <div class="message">
                        ${message}
                    </div>
                   
                </div>
            </div>`
        $(".chat_more .chat_list").insertAdjacentHTML("beforeend", html)
    }
}


//监听消息发送点击事件
function sendMessage() {
    const { value } = $("#sendMessageInput");
    if (!value.trim()) return;
    if (isPrivateChat) {
        const { avatar, nickName } = user;
        const html = `<div class="chat_list_item chat_list_self">
                <div class="avatar_info">
                    <img src=${avatar}
                        alt="">
                </div>
                <div class="chat_info">
                    <div class="create_time">${nickName}</div>
                    <div class="message">
                        ${value}
                    </div>
                   
                </div>
            </div>`
        $(".chat_private .chat_list").insertAdjacentHTML("beforeend", html)
        socket.emit("privateChat", { targetUserId: targetId, message: value })
    } else {
        socket.emit("broadMessage", { user, message: value });
    }
    $("#sendMessageInput").value = ''
}
