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

    const content = quillInstance.root.innerHTML;

    if (!title || !content.trim() || !boardType) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('qboard', new Blob([JSON.stringify({
      title: title,
      content: content,
      boardType: boardType // 카테고리 정보 추가
    })], { type: "application/json" }));

    // 첨부 파일이 있는 경우 FormData에 추가
    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('images', file);
      });
    }

    console.log('전송할 데이터:', {
      title,
      content,
      boardType,
      files: files.map(file => file.name)
    });

    try {
      const response = await fetch('http://10.125.121.188:8080/api/qboards', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('게시글이 작성되었습니다.');
        navigate('/qna');
      } else {
        throw new Error('게시글 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('서버에 문제가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  };

  const handleCancelClick = () => {
    navigate('/qna');
  };

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
                <option value="product">상품문의</option>
                <option value="etc">기타문의</option>
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