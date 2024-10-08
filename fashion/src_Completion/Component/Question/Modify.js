import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import '../../CSS/Modify.css'; 

const Modify = () => {
  const { id } = useParams(); // 게시글 id를 받아옴
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [files, setFiles] = useState([]); // 다중 파일을 위해 배열로 변경
  const [content, setContent] = useState(''); 
  const [quillInstance, setQuillInstance] = useState(null);

  useEffect(() => {
    // 게시글 데이터를 불러오는 API 호출
    fetch(`http://10.125.121.188:8080/api/qboards/${id}`)
      .then(response => response.json())
      .then(data => {
        setTitle(data.title);
        setCategory(data.boardType); 
        setContent(data.content); 
        // Quill 에디터 초기화 및 기존 내용 설정
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
          quill.clipboard.dangerouslyPasteHTML(data.content);
          setQuillInstance(quill); 
        }
      })
      .catch(error => console.error('게시글을 불러오는 중 오류가 발생했습니다.', error));
  }, [id]);

  const handleSubmitClick = async () => {
    if (!quillInstance) {
      console.error('Quill 에디터가 초기화되지 않았습니다.');
      return;
    }

    const updatedContent = quillInstance.root.innerHTML; // 수정된 내용 가져오기

    // 수정한 데이터를 서버에 전송하는 로직
    const formData = new FormData();
    formData.append('title', title);
    formData.append('boardType', category);
    formData.append('content', updatedContent);

    // files 배열에 있는 모든 이미지를 FormData에 추가
    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('images', file);
      });
    }

    try {
      const response = await fetch(`http://10.125.121.188:8080/api/qboards/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        alert('게시글이 수정되었습니다.');
        navigate(`/qna/${id}`);
      } else {
        throw new Error('게시글 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 수정 중 오류가 발생했습니다.', error);
      alert('서버에 문제가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  };

  const handleCancelClick = () => {
    navigate('/qna'); 
  };

  // 첨부 파일 변경 시 동작
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]); 
  };

  return (
    <div className="modify-form-container">
      <h2 className="modify-form-title">Q&A 수정</h2>
      <p className="modify-form-description">
        *문의에 대한 답변의 응답 시간은 최대한 빠르게 관리자들이 답변드리려고 합니다. 급한 문의 시 연락주세요.
      </p>

      <table className="modify-form-table">
        <tbody>
          <tr>
            <th>제목</th>
            <td>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="제목을 입력하세요." 
                className="modify-form-input" 
              />
            </td>
          </tr>
          <tr>
            <th>카테고리</th>
            <td>
              <select 
                className="modify-form-select" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="product">상품문의</option>
                <option value="etc">기타문의</option>
              </select>
            </td>
          </tr>
          <tr>
            <th>내용</th>
            <td>
              <div ref={quillRef} className="modify-form-editor" />
            </td>
          </tr>
          <tr>
            <th>첨부파일</th>
            <td>
              <input 
                type="file" 
                className="modify-form-file-input"
                multiple // 다중 파일 선택 가능
                onChange={handleFileChange}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="modify-form-actions">
        <button className="modify-form-submit-button" onClick={handleCancelClick}>취소</button>
        <button className="modify-form-submit-button" onClick={handleSubmitClick}>수정</button>
      </div>
    </div>
  );
};

export default Modify;