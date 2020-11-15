import React, {FC, useState, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Modal from '../shared/Modal';
import FileUpload from '../shared/FileUpload';
import Button from '../shared/Button';
import { addImage } from '../../store/actions/galleryActions';
import {RootState} from '../../store';

interface UploadImageModalProps {
    onClose: () => void;
}

interface Image {
    name: string;
    progress: number;
}

const UploadImageModal: FC<UploadImageModalProps> = ({ onClose }) => {
    const [files, setFiles] = useState<FileList | null>();
    const [filesArr, setFilesArr] = useState<Image[]>([]);
    const [disbaled, setDisabled] = useState(true);
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const changeHanlder = (e: FormEvent<HTMLInputElement>) => {
        if(e.currentTarget.files && e.currentTarget.files.length) {
            setDisabled(false);
            let images: Image[] = [];
            Array
                .from(e.currentTarget.files)
                .forEach(file => images.push({
                name: file.name,
                progress: 0
            }));
            setFilesArr(images);
        } else {
            setFilesArr([]);
            setDisabled(true);
        }
        setFiles(e.currentTarget.files);
    }

    const submitHandler = (e: FormEvent) => {
        e.preventDefault();

        // if files are added
        // and if user is available
        if(files && files.length > 0 && user) {
            dispatch(addImage(files, user, (progress, file) => {
                const copyOfFilesArr = [...filesArr];
                const findFile = copyOfFilesArr.find(f => f.name === file.name);
                if(findFile) {
                    findFile.progress = Math.floor(progress);
                }

                const updatedArr = copyOfFilesArr.map(f => f.name === file.name ? findFile ? findFile : f : f); 
                setFilesArr(updatedArr);
            }))
            setFiles(null);
            setDisabled(true);
        }
    }

    return (
        <Modal onClose={onClose} title="Upload Image">
            <form onSubmit={submitHandler}>
                <FileUpload onChange={changeHanlder}/>
                {filesArr.length > 0 && 
                    <ul className="mt-3 mb-3">
                        {filesArr.map((file: Image, index) => {
                            <li key={index}>
                                <p className="is-size-7 mb-1">
                                    {file.name}
                                    {file.progress === 100 && <span className="m1-1 has-text-success has-text-weight-bold">UPLOADED</span>}
                                </p>
                                <progress 
                                    className="progress is-primary is-small"
                                    value={file.progress}
                                    max="100"
                                >
                                    {file.progress}
                                </progress>
                            </li>
                        })}
                    </ul>
                }
                <Button 
                    text="Upload"
                    disabled={disbaled}
                    className="is-primary mt-2"
                />
            </form>
        </Modal>
    )
}

export default UploadImageModal;