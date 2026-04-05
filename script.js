function escapeHtml(text) {
    if (!text) return '';
    return text.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function formatText(text) {
    if (!text) return '';
    let safeText = escapeHtml(text);
    return safeText.replace(/\{\{(.*?)\}\}/g, '<span class="sns-highlight">$1</span>');
}

let commentsData = [];
let localImages = { avatar: '', image: '' };

function clearLocal(type) {
    localImages[type] = '';
    updatePreview();
}

function handleImageUpload(input, type) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            localImages[type] = e.target.result;
            if (type === 'avatar') document.getElementById('in-avatar').value = '';
            if (type === 'image') document.getElementById('in-image').value = '';
            updatePreview();
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function handleCommentImageUpload(input, cIdx, rIdx = null) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Img = e.target.result;
            if (rIdx === null) updateComment(cIdx, 'avatar', base64Img);
            else updateReply(cIdx, rIdx, 'avatar', base64Img);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function getDisplayUrl(url) {
    return url.startsWith('data:image') ? '(PC 이미지 적용됨)' : url;
}

function renderCommentEditor() {
    const container = document.getElementById('comment-editor-container');
    container.innerHTML = commentsData.map((c, cIdx) => `
        <div class="comment-edit-box">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-size:0.85rem; font-weight:700; color:var(--text-main);">댓글 ${cIdx + 1}</span>
                <button class="btn-small btn-delete" onclick="deleteComment(${cIdx})"><i class="fa-solid fa-trash"></i> 삭제</button>
            </div>
            <div class="row-inputs">
                <input type="text" class="styled-input-sm" placeholder="아이디" value="${escapeHtml(c.name)}" onchange="updateComment(${cIdx}, 'name', this.value)">
                <input type="text" class="styled-input-sm" placeholder="시간" value="${escapeHtml(c.time)}" style="width: 80px;" onchange="updateComment(${cIdx}, 'time', this.value)">
            </div>
            
            <div class="upload-row">
                <input type="text" class="styled-input-sm" placeholder="프사 URL" value="${escapeHtml(getDisplayUrl(c.avatar))}" onchange="updateComment(${cIdx}, 'avatar', this.value)">
                <label class="btn-icon-upload" style="width:38px; height:38px; border-radius:10px;" title="PC 사진">
                    <i class="fa-solid fa-paperclip" style="font-size:0.95rem;"></i>
                    <input type="file" accept="image/*" style="display:none;" onchange="handleCommentImageUpload(this, ${cIdx})">
                </label>
            </div>

            <input type="text" class="styled-input-sm" placeholder="댓글 내용 ({{글자}} 색상 강조)" value="${escapeHtml(c.text)}" onchange="updateComment(${cIdx}, 'text', this.value)">
            
            <div class="comment-edit-options">
                <label><input type="checkbox" ${c.isAuthor ? 'checked' : ''} onchange="updateComment(${cIdx}, 'isAuthor', this.checked)"> 작성자 배지</label>
                <label><input type="checkbox" ${c.authorLiked ? 'checked' : ''} onchange="updateComment(${cIdx}, 'authorLiked', this.checked)"> 작성자 하트</label>
                <span style="margin-left:auto; display:flex; align-items:center; gap:6px;">좋아요 <input type="number" class="styled-input-sm" value="${c.likes}" style="width: 60px; padding: 4px 8px; box-shadow:none; border:1px solid var(--border-color);" onchange="updateComment(${cIdx}, 'likes', this.value)"></span>
            </div>
            
            ${c.replies.map((r, rIdx) => `
                <div class="reply-edit-box">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);"><i class="fa-solid fa-arrow-turn-up fa-rotate-90"></i> 답글 ${rIdx + 1}</span>
                        <button class="btn-small btn-delete" style="padding: 4px 8px;" onclick="deleteReply(${cIdx}, ${rIdx})"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="row-inputs">
                        <input type="text" class="styled-input-sm" placeholder="아이디" value="${escapeHtml(r.name)}" onchange="updateReply(${cIdx}, ${rIdx}, 'name', this.value)">
                        <input type="text" class="styled-input-sm" placeholder="시간" value="${escapeHtml(r.time)}" style="width: 70px;" onchange="updateReply(${cIdx}, ${rIdx}, 'time', this.value)">
                    </div>
                    <div class="upload-row">
                        <input type="text" class="styled-input-sm" placeholder="프사 URL" value="${escapeHtml(getDisplayUrl(r.avatar))}" onchange="updateReply(${cIdx}, ${rIdx}, 'avatar', this.value)">
                        <label class="btn-icon-upload" style="width:38px; height:38px; border-radius:10px;" title="PC 사진">
                            <i class="fa-solid fa-paperclip" style="font-size:0.95rem;"></i>
                            <input type="file" accept="image/*" style="display:none;" onchange="handleCommentImageUpload(this, ${cIdx}, ${rIdx})">
                        </label>
                    </div>
                    <input type="text" class="styled-input-sm" placeholder="답글 내용 ({{글자}} 색상 강조)" value="${escapeHtml(r.text)}" onchange="updateReply(${cIdx}, ${rIdx}, 'text', this.value)">
                    <div class="comment-edit-options">
                        <label><input type="checkbox" ${r.isAuthor ? 'checked' : ''} onchange="updateReply(${cIdx}, ${rIdx}, 'isAuthor', this.checked)"> 배지</label>
                        <label><input type="checkbox" ${r.authorLiked ? 'checked' : ''} onchange="updateReply(${cIdx}, ${rIdx}, 'authorLiked', this.checked)"> 하트</label>
                        <span style="margin-left:auto; display:flex; align-items:center; gap:6px;">좋아요 <input type="number" class="styled-input-sm" value="${r.likes}" style="width: 60px; padding: 4px 8px; box-shadow:none; border:1px solid var(--border-color);" onchange="updateReply(${cIdx}, ${rIdx}, 'likes', this.value)"></span>
                    </div>
                </div>
            `).join('')}
            
            <button class="btn-small btn-add-reply" style="margin-top:8px;" onclick="addReply(${cIdx})">+ 답글 달기</button>
        </div>
    `).join('');
    updatePreview();
}

function updateComment(cIdx, field, value) { commentsData[cIdx][field] = value; updatePreview(); }
function updateReply(cIdx, rIdx, field, value) { commentsData[cIdx].replies[rIdx][field] = value; updatePreview(); }
function addComment() { commentsData.push({ name: "", avatar: "", time: "", text: "", isAuthor: false, authorLiked: false, likes: 0, replies: [] }); renderCommentEditor(); }
function addReply(cIdx) { commentsData[cIdx].replies.push({ name: "", avatar: "", time: "", text: "", isAuthor: false, authorLiked: false, likes: 0 }); renderCommentEditor(); }
function deleteComment(cIdx) { commentsData.splice(cIdx, 1); renderCommentEditor(); }
function deleteReply(cIdx, rIdx) { commentsData[cIdx].replies.splice(rIdx, 1); renderCommentEditor(); }

function toggleActionCount(elementId, countValue) {
    const el = document.getElementById(elementId);
    if (countValue && Number(countValue) > 0) {
        el.style.display = 'inline-block';
        el.innerText = countValue;
    } else {
        el.style.display = 'none';
    }
}

function updatePreview() {
    const authorName = document.getElementById('in-name').value || '작성자명';
    const finalAvatar = document.getElementById('in-avatar').value || localImages['avatar'];
    const finalImage = document.getElementById('in-image').value || localImages['image'];
    
    document.getElementById('out-name').innerText = authorName;
    document.getElementById('out-name-bold').innerText = authorName;
    
    const avatarImg = document.getElementById('out-avatar');
    if(finalAvatar) { avatarImg.src = finalAvatar; avatarImg.style.display = 'block'; }
    else { avatarImg.src = ''; avatarImg.style.display = 'none'; }
    
    const postImg = document.getElementById('out-image');
    if(finalImage) { postImg.src = finalImage; postImg.style.display = 'block'; }
    else { postImg.src = ''; postImg.style.display = 'none'; }
    
    const showRing = document.getElementById('in-show-ring').checked;
    const ringEl = document.getElementById('out-avatar-ring');
    if (showRing) ringEl.classList.add('active');
    else ringEl.classList.remove('active');

    const musicText = document.getElementById('in-music').value;
    const musicContainer = document.getElementById('out-music-container');
    if (musicText) {
        musicContainer.style.display = 'flex';
        document.getElementById('out-music').innerText = musicText;
    } else {
        musicContainer.style.display = 'none';
    }
    
    const likeType = document.querySelector('input[name="like-type"]:checked').value;
    const likeId = document.getElementById('in-like-id').value || '누군가';
    const likesContainer = document.getElementById('out-likes-container');
    
    if (likeType === 'text') {
        likesContainer.style.display = 'block';
        likesContainer.innerHTML = `<strong>${escapeHtml(likeId)}</strong>님 외<strong> 여러 명이 좋아합니다</strong>`;
    } else {
        likesContainer.style.display = 'none';
        likesContainer.innerHTML = '';
    }

    toggleActionCount('out-action-heart', document.getElementById('in-action-heart').value);
    toggleActionCount('out-action-share', document.getElementById('in-action-share').value);
    
    let totalComments = commentsData.length;
    commentsData.forEach(c => { totalComments += c.replies.length; });
    toggleActionCount('out-comment-count', totalComments);

    document.getElementById('out-content').innerHTML = formatText(document.getElementById('in-content').value);
    document.getElementById('out-time').innerText = document.getElementById('in-time').value;
    
    renderCommentsView(finalAvatar);
}

function renderCommentsView(mainAvatar) {
    const area = document.getElementById('out-comments-area');
    
    if (!commentsData || commentsData.length === 0) { 
        area.innerHTML = ''; 
        area.style.display = 'none'; 
        return; 
    }
    
    area.style.display = 'flex';
    area.innerHTML = commentsData.map((c, cIndex) => `
        <div class="sns-comment-wrap">
            <div class="sns-comment-row">
                <div class="sns-c-avatar-wrap">
                    <div class="sns-c-avatar-box"><img src="${escapeHtml(c.avatar)}" onerror="this.style.display='none'"></div>
                </div>
                <div class="sns-c-main">
                    <div class="sns-c-header">
                        <span class="sns-c-name">${escapeHtml(c.name)}</span><span class="sns-c-time">${escapeHtml(c.time)}</span>
                        ${c.authorLiked ? `<div class="sns-author-liked-badge"><img src="${escapeHtml(mainAvatar)}" onerror="this.style.display='none'"><span class="fa-solid fa-heart">&#8203;</span></div>` : ''}
                        ${c.isAuthor ? `<span class="sns-c-isauthor">・ 작성자</span>` : ''}
                    </div>
                    <div class="sns-c-text">${formatText(c.text)}</div>
                    <div class="sns-c-actions">
                        <button class="sns-c-reply-btn">답글 달기</button>
                        <span class="sns-c-share-btn">공유</span>
                    </div>
                </div>
                <div class="sns-c-right"><span class="fa-regular fa-heart">&#8203;</span>${c.likes > 0 ? `<span class="sns-c-like-cnt">${c.likes}</span>` : ''}</div>
            </div>
            ${c.replies && c.replies.length > 0 ? `
                <div class="sns-replies-container">
                    <div class="sns-comment-row">
                        <div class="sns-c-avatar-wrap">
                            <div class="sns-c-avatar-box reply-avatar-box"><img src="${escapeHtml(c.replies[0].avatar)}" onerror="this.style.display='none'"></div>
                        </div>
                        <div class="sns-c-main">
                            <div class="sns-c-header">
                                <span class="sns-c-name">${escapeHtml(c.replies[0].name)}</span><span class="sns-c-time">${escapeHtml(c.replies[0].time)}</span>
                                ${c.replies[0].authorLiked ? `<div class="sns-author-liked-badge"><img src="${escapeHtml(mainAvatar)}" onerror="this.style.display='none'"><span class="fa-solid fa-heart">&#8203;</span></div>` : ''}
                                ${c.replies[0].isAuthor ? `<span class="sns-c-isauthor">・ 작성자</span>` : ''}
                            </div>
                            <div class="sns-c-text">${formatText(c.replies[0].text)}</div>
                            <div class="sns-c-actions">
                                <button class="sns-c-reply-btn">답글 달기</button>
                                <span class="sns-c-share-btn">공유</span>
                            </div>
                        </div>
                        <div class="sns-c-right"><span class="fa-regular fa-heart">&#8203;</span>${c.replies[0].likes > 0 ? `<span class="sns-c-like-cnt">${c.replies[0].likes}</span>` : ''}</div>
                    </div>
                    ${c.replies.length > 1 ? `
                        <div class="sns-hidden-replies">
                            ${c.replies.slice(1).map(r => `
                                <div class="sns-comment-row">
                                    <div class="sns-c-avatar-wrap">
                                        <div class="sns-c-avatar-box reply-avatar-box"><img src="${escapeHtml(r.avatar)}" onerror="this.style.display='none'"></div>
                                    </div>
                                    <div class="sns-c-main">
                                        <div class="sns-c-header">
                                            <span class="sns-c-name">${escapeHtml(r.name)}</span><span class="sns-c-time">${escapeHtml(r.time)}</span>
                                            ${r.authorLiked ? `<div class="sns-author-liked-badge"><img src="${escapeHtml(mainAvatar)}" onerror="this.style.display='none'"><span class="fa-solid fa-heart">&#8203;</span></div>` : ''}
                                            ${r.isAuthor ? `<span class="sns-c-isauthor">・ 작성자</span>` : ''}
                                        </div>
                                        <div class="sns-c-text">${formatText(r.text)}</div>
                                        <div class="sns-c-actions">
                                            <button class="sns-c-reply-btn">답글 달기</button>
                                            <span class="sns-c-share-btn">공유</span>
                                        </div>
                                    </div>
                                    <div class="sns-c-right"><span class="fa-regular fa-heart">&#8203;</span>${r.likes > 0 ? `<span class="sns-c-like-cnt">${r.likes}</span>` : ''}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="sns-more-replies" onclick="toggleReplies(this, ${c.replies.length - 1})">
                            <div class="reply-line"></div><span class="toggle-text">답글 ${c.replies.length - 1}개 더 보기</span>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function toggleReplies(btn, count) {
    const target = btn.closest('.sns-replies-container').querySelector('.sns-hidden-replies');
    const textSpan = btn.querySelector('.toggle-text');
    
    if (target.classList.contains('active')) {
        target.classList.remove('active');
        textSpan.innerText = '답글 ' + count + '개 더 보기';
    } else {
        target.classList.add('active');
        textSpan.innerText = '답글 숨기기';
    }
}

function clipboardCopy(text, msgText) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => showCopyMsg(msgText)).catch(() => fallbackCopy(text, msgText));
    } else {
        fallbackCopy(text, msgText);
    }
}

function fallbackCopy(text, msgText) {
    let textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus(); textArea.select();
    try { document.execCommand('copy'); showCopyMsg(msgText); } catch (err) { alert('복사에 실패했습니다.'); }
    textArea.remove();
}

function showCopyMsg(msgText) {
    const msg = document.getElementById('copy-msg');
    msg.innerText = msgText;
    setTimeout(() => msg.innerText = "", 3000);
}

function copyHTML() {
    const htmlCode = document.getElementById('preview-card').outerHTML;
    clipboardCopy(htmlCode, "✅ HTML 본문이 복사되었습니다!");
}

function copyCSS() {
    const cssCode = `/* 인스타 카드 위젯 CSS */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
.sns-post-preview { width: 100%; max-width: 480px; background: #fff; border: 1px solid #eaeaea; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.06); text-align: left; line-height: 1.5; color: #111; margin: 20px auto; font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;}
.sns-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; }
.sns-profile { display: flex; align-items: center; gap: 12px; }
.sns-avatar-ring { width: 42px; height: 42px; border-radius: 50%; display: flex; justify-content: center; align-items: center; }
.sns-avatar-ring.active { background: linear-gradient(to bottom left, #d92e7f, #f58529); padding: 2px; }
.sns-avatar-box { width: 100%; height: 100%; border-radius: 50%; border: 2px solid #fff; background-color: #f5f5f5; overflow: hidden; display: flex; justify-content: center; align-items: center; }
.sns-avatar-box img { width: 100%; height: 100%; object-fit: cover; border: 1px solid #d9d9d9; border-radius: 50%; }
.sns-info { display: flex; flex-direction: column; }
.sns-name { font-weight: 600; font-size: 0.95rem; color: #111; margin: 0; }
.sns-music-container { font-size: 0.8rem; color: #111; display: flex; align-items: center; gap: 8px; font-weight: 400; }
.sns-more { background: none; border: none; font-size: 1.2rem; color: #111; cursor: pointer; }
.sns-img-box { width: 100%; aspect-ratio: 1 / 1; background-color: #fafafa; overflow: hidden; display: flex; justify-content: center; align-items: center; border-top: 1px solid #fafafa; border-bottom: 1px solid #fafafa;}
.sns-img-box img { width: 100%; height: 100%; object-fit: cover; }
.sns-body { padding: 16px 16px 20px; }
.sns-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.sns-actions-left { display: flex; align-items: center; gap: 18px; }
.sns-actions-left button, .sns-action-btn-right { background: none; border: none; font-size: 1.7rem; color: #111; cursor: pointer; padding: 0; display: flex; align-items: center; gap: 6px; margin-right: 0; }
.sns-action-count { font-size: 1rem; font-weight: 600; color: #111; }
.sns-likes { font-weight: 400; font-size: 0.95rem; margin-bottom: 3px; color: #111; }
.sns-likes strong { font-weight: 600; }
.sns-content { font-size: 0.95rem; color: #111; white-space: pre-wrap; word-break: break-all; }
.sns-content strong { font-weight: 600; margin-right: 3px; }
.sns-time { font-size: 0.75rem; color: #888; margin-top: 10px; font-weight: 500;}
.sns-comments-area { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; border-top: 1px solid #f0f0f0; padding-top: 16px; }
.sns-comment-wrap { display: flex; flex-direction: column; gap: 12px; }
.sns-comment-row { display: flex; gap: 12px; align-items: flex-start; }
.sns-c-avatar-wrap { position: relative; flex-shrink: 0; padding-top: 4px; }
.sns-c-avatar-box { width: 42px; height: 42px; border-radius: 50%; background-color: #f5f5f5; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05); overflow: hidden; display: flex; justify-content: center; align-items: center; }
.sns-c-avatar-box img { width: 100%; height: 100%; object-fit: cover; }
.reply-avatar-box { width: 38px; height: 38px; }
.sns-author-liked-badge { position: relative; width: 16px; height: 16px; border-radius: 50%; border: 1px solid #eaeaea; background-color: #fff; overflow: hidden; display: inline-block; vertical-align: middle; }
.sns-author-liked-badge img { width: 100%; height: 100%; object-fit: cover; }
.sns-author-liked-badge span.fa-heart { position: absolute; top: 50%; right: -5px; transform: translateY(-50%); font-size: 9px; color: #ff4757; border-radius: 50%; padding: 1px; box-shadow: 0 0 2px rgba(0,0,0,0.1); z-index: 10; }
.sns-c-main { flex: 1; display: flex; flex-direction: column; gap: 4px; padding-top: 2px; }
.sns-c-header { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; flex-wrap: wrap; }
.sns-c-name { font-weight: 600; color: #111; }
.sns-c-time { color: #888; font-size: 0.75rem; }
.sns-c-isauthor { color: #888; font-size: 0.75rem; }
.sns-c-text { font-size: 0.9rem; color: #111; line-height: 1.4; }
.sns-c-actions { display: flex; align-items: center; gap: 12px; margin-top: 2px; }
.sns-c-reply-btn, .sns-c-share-btn { background: none; border: none; font-size: 0.8rem; font-weight: 600; color: #888; cursor: pointer; padding: 0; }
.sns-c-right { display: flex; flex-direction: column; align-items: center; gap: 4px; padding-top: 8px; flex-shrink: 0; width: 24px; }
.sns-c-right span.fa-heart { font-size: 1.1rem; color: #888; cursor: pointer; }
.sns-c-like-cnt { font-size: 0.7rem; color: #888; font-weight: 600; }
.sns-replies-container { margin-left: 48px; display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }
.sns-more-replies { display: flex; align-items: center; gap: 12px; cursor: pointer; margin-top: 4px; }
.reply-line { width: 30px; height: 1px; background: #888; }
.sns-more-replies span { font-size: 0.8rem; font-weight: 600; color: #888; }
.sns-hidden-replies { display: none; flex-direction: column; gap: 12px; margin-top: 12px; }
.sns-hidden-replies.active { display: flex !important; }
.sns-highlight { color: #3743CB; }`; /* 강조색상 추가 */
    clipboardCopy(cssCode.trim(), "✅ 스킨용 CSS가 복사되었습니다!");
}

function copyJS() {
    const jsCode = `<script>
function toggleReplies(btn, count) {
    const target = btn.closest('.sns-replies-container').querySelector('.sns-hidden-replies');
    const textSpan = btn.querySelector('.toggle-text');
    
    if (target.classList.contains('active')) {
        target.classList.remove('active');
        textSpan.innerText = '답글 ' + count + '개 더 보기';
    } else {
        target.classList.add('active');
        textSpan.innerText = '답글 숨기기';
    }
}
</script>`;
    clipboardCopy(jsCode, "✅ 스킨용 JS가 복사되었습니다!");
}

function downloadImage() {
    const card = document.getElementById('preview-card');
    
    html2canvas(card, { 
        useCORS: true, 
        backgroundColor: '#FFFFFF', 
        scale: 3,
        onclone: (clonedDoc) => {
            const clonedCard = clonedDoc.getElementById('preview-card');
            clonedCard.style.border = 'none';
            clonedCard.style.boxShadow = 'none';
            clonedCard.style.margin = '0';
        }
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `insta_post_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(err => alert("이미지 저장 오류! 외부 링크 이미지가 원인일 수 있습니다."));
}
renderCommentEditor();