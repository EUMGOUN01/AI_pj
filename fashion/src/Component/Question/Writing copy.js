import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import '../../CSS/Writing.css'; 

const Writing = () => {
  const quillRef = useRef(null);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [boardType, setBoardType] = useState('');
  const [files, setFiles] = useState([]); 
  const [quillInstance, setQuillInstance] = useState(null);

  useEffect(() => {
    if (quillRef.current) {
      const quill = new Quill(quillRef.current, {
        theme: 'snow',
        placeholder: '내용을 입력하세요...',
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, 4, 5, 6, false] }, { font: [] }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ align: [] }],
              [{ color: [] }, { background: [] }],
              ['link', 'image', 'video'],
              ['clean']
            ],
            handlers: {
              image: () => {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                input.setAttribute('multiple', true);
                input.click();

                input.onchange = () => {
                  const selectedFiles = Array.from(input.files);
                  if (selectedFiles.length > 0) {
                    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
                    selectedFiles.forEach((file) => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const range = quill.getSelection();
                        quill.insertEmbed(range.index, 'image', reader.result);
                      };
                      reader.readAsDataURL(file);
                    });
                  }
                };
              },
            },
          },
        },
      });
      setQuillInstance(quill);
    }
  }, []);

  const handleSubmitClick = async () => {
    if (!quillInstance) {
      console.error('Quill 인스턴스가 초기화되지 않았습니다.');
      return;
    }
  
    let content = quillInstance.root.innerHTML;
  
    if (!title || !content.trim() || !boardType) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
  
    // 이미지 태그를 찾아서 Base64로 변환하는 작업
    const images = quillInstance.root.querySelectorAll('img');
    const base64Promises = Array.from(images).map((img) => {
      return new Promise((resolve, reject) => {
        const src = img.getAttribute('src');
  
        // 이미지가 이미 base64 형식인 경우 건너뜀
        if (src.startsWith('data:image')) {
          resolve();
        } else {
          fetch(src)
            .then((response) => response.blob())
            .then((blob) => {
              const reader = new FileReader();
              reader.onload = () => {
                img.setAttribute('src', reader.result);
                resolve();
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
        }
      });
    });
  
    // 모든 이미지 처리가 끝나면 content 업데이트
    try {
      await Promise.all(base64Promises);
      content = quillInstance.root.innerHTML;
    } catch (error) {
      console.error('이미지 처리 중 오류 발생:', error);
      alert('이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      return;
    }
  
    // JSON 데이터 생성
    const data = {
      title: title,
      content: content,
      boardType: boardType,
    };
  
    console.log('전송할 데이터:', data);
  
    try {
      const response = await fetch('http://10.125.121.188:8080/api/qboards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(data),
      });
    
      if (response.ok) {
        alert('게시글이 작성되었습니다.');
        navigate('/qna');
      } else {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        alert('게시글 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('서버에 문제가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  };
  const handleCancelClick = () => {
    navigate('/qna');
  };

  // 이미지 눌러진 순간. <= 이미지 업로드 api 연결 해야함
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="writing-form-container">
      <h2 className="writing-form-title">Q&A</h2>
      <p className="writing-form-description">
        *문의에 대한 답변의 응답 시간은 최대한 빠르게 관리자들이 답변드리려고 합니다. 급한 문의 시 연락주세요.
      </p>

      <table className="writing-form-table">
        <tbody>
          <tr>
            <th>제목</th>
            <td>
              <input 
                type="text" 
                placeholder="제목을 입력하세요." 
                className="writing-form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <th>카테고리</th>
            <td>
              <select 
                className="writing-form-select"
                value={boardType}
                onChange={(e) => setBoardType(e.target.value)}
              >
                <option value="">카테고리를 선택하세요.</option>
                <option value="ProductQnA">상품문의</option>
                <option value="EtcQnA">기타문의</option>
              </select>
            </td>
          </tr>
          <tr>
            <th>내용</th>
            <td>
              <div ref={quillRef} className="writing-form-editor" />
            </td>
          </tr>
          <tr>
            <th>첨부파일</th>
            <td style={{ display: "flex", alignItems: "center" }}>
              <div className="custom-file-input">
                <button className="file-select-button" onClick={() => document.getElementById('file-upload').click()}>
                  파일 선택
                </button>
                <input 
                  id="file-upload"
                  type="file" 
                  className="writing-form-file-input"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="file-preview-container" style={{ marginLeft: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {files.map((file, index) => (
                  <div key={file.name} className="file-preview-item" style={{ display: 'flex', alignItems: 'center' }}>
                    <span>{file.name}</span>
                    <button onClick={() => handleRemoveFile(index)} className="remove-file-button" style={{ marginLeft: '5px' }}>x</button>
                  </div>
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="writing-form-actions">
        <button className="writing-form-submit-button" onClick={handleCancelClick}>취소</button>
        <button className="writing-form-submit-button" onClick={handleSubmitClick}>작성</button>
      </div>
    </div>
  );
};

export default Writing;