

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIssue } from '../../api/user'; 

const RaiseIssue = () => {
    const navigate = useNavigate();
    const [popup, setPopup] = useState({ isOpen: false, status: '', message: '' }); 
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Plumbing'); 

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setImages((prevImages) => [...prevImages, ...selectedFiles]);
        }
    };

    const removeImage = (indexToRemove) => {
        setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);
    //     setError('');
    //     setMessage('');

    //     try {
    //         const formBox = new FormData();
    //         formBox.append('title', title);
    //         formBox.append('description', description);
    //         formBox.append('category', category);

    //         images.forEach((imageFile) => {
    //             formBox.append('images', imageFile);
    //         });

    //         await createIssue(formBox);

    //         setMessage("Success! Your issue has been submitted to the administration.");
    //         setTitle('');
    //         setDescription('');
    //         setCategory('Plumbing');
    //         setImages([]); 

    //     } catch (err) {
    //         console.error(err);
    //         setError(err.response?.data?.detail || "Failed to submit issue. Please try again.");
    //         setPopup({
    //             isOpen: true,
    //             status: 'error',
    //             message: err.response?.data?.error || err.response?.data?.detail || 'Failed to load your assigned tasks.'
    //         });
    //     } finally {
    //         setLoading(false);
    //     }
    // };  

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const formBox = new FormData();
            formBox.append('title', title);
            formBox.append('description', description);
            formBox.append('category', category);

            images.forEach((imageFile) => {
                formBox.append('images', imageFile);
            });

            await createIssue(formBox);

            setPopup({
                isOpen: true,
                status: 'success',
                message: "Success! Your issue has been submitted to the administration."
            });
            setTitle('');
            setDescription('');
            setCategory('Plumbing');
            setImages([]); 

            setTimeout(() => {
                setPopup({ isOpen: false, status: '', message: '' });
                if (onSuccess) onSuccess();
            }, 1500);

        } catch (err) {
            console.error(err);
            const errorText = err.response?.data?.error || err.response?.data?.detail || "Failed to submit issue. Please try again.";
            setError(errorText);
            setPopup({
                isOpen: true,
                status: 'error',
                message: errorText
            });
        } finally {
            setLoading(false);
        }
    };
    return (

        <div className="max-w-2xl p-6 mx-auto mt-8 transition-all duration-300 bg-slate-900 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl relative overflow-hidden">
            
            <div className="absolute top-0 left-1/2 w-full h-1/2 bg-cyan-500/5 -translate-x-1/2 blur-[100px] pointer-events-none"></div>

            <div className="relative z-10">
                {/* COMPACT UPDATE: Tighter margins on the header */}
                <div className="pb-4 mb-6 border-b border-slate-800/80">
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                        Report an Issue
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Help us keep the community in top shape. Describe the problem below.
                    </p>
                </div>
                
                {message && (
                    <div className="flex items-center p-3 mb-5 text-sm text-emerald-200 bg-emerald-900/30 border border-emerald-500/30 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="font-medium">{message}</span>
                    </div>
                )}
                {error && (
                    <div className="flex items-center p-3 mb-5 text-sm text-rose-200 bg-rose-900/30 border border-rose-500/30 rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                        <svg className="w-5 h-5 mr-2 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {/* COMPACT UPDATE: Tighter spacing between form fields */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label className="block mb-1.5 text-sm font-semibold text-slate-300">Issue Title</label>
                            <input 
                                type="text" 
                                required
                                placeholder="E.g., Broken pipe in the kitchen"
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                className="w-full p-2.5 text-sm transition-all duration-200 bg-slate-800/50 border border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none placeholder-slate-500 shadow-inner"
                            />
                        </div>

                        <div>
                            <label className="block mb-1.5 text-sm font-semibold text-slate-300">Category</label>
                            <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-2.5 text-sm transition-all duration-200 bg-slate-800/50 border border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none cursor-pointer shadow-inner appearance-none"
                            >
                                <option className="bg-slate-800" value="Plumbing">Plumbing</option>
                                <option className="bg-slate-800" value="Electrical">Electrical</option>
                                <option className="bg-slate-800" value="Cleaning">Cleaning</option>
                                <option className="bg-slate-800" value="Security">Security</option>
                                <option className="bg-slate-800" value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1.5 text-sm font-semibold text-slate-300">Detailed Description</label>
                        {/* COMPACT UPDATE: Changed rows to 2, and added resize-y so the user can drag it larger */}
                        <textarea 
                            required
                            rows="2"
                            placeholder="Provide details..."
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            className="w-full p-3 text-sm transition-all duration-200 bg-slate-800/50 border border-slate-700 text-slate-100 rounded-lg focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-y placeholder-slate-500 shadow-inner min-h-[70px]"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block mb-1.5 text-sm font-semibold text-slate-300">Attach Photos (Optional)</label>
                        <div className="flex items-center justify-center w-full">
                            {/* COMPACT UPDATE: Removed fixed h-40, replaced with simple vertical padding py-6 */}
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full py-6 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-800/30 hover:bg-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 group">
                                <div className="flex flex-col items-center justify-center">
                                    <svg className="w-8 h-8 mb-2 text-cyan-500 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    <p className="text-sm text-slate-400"><span className="font-semibold text-cyan-400">Click to upload</span> or drag</p>
                                </div>
                                <input id="dropzone-file" type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>

                        {/* Images thumbnails will push the height down organically when added! */}
                        {images.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-xs font-medium text-slate-400">Selected ({images.length})</p>
                                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                                    {images.map((img, index) => (
                                        <div key={index} className="relative group rounded-md overflow-hidden border border-slate-700 shadow-lg">
                                            {/* COMPACT UPDATE: Made thumbnail slightly smaller h-16 */}
                                            <img src={URL.createObjectURL(img)} alt={`Preview ${index}`} className="block object-cover w-full h-16 transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 transition-opacity duration-200 bg-slate-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                <button type="button" onClick={() => removeImage(index)} className="p-1.5 bg-rose-500/90 text-white rounded-full hover:bg-rose-500 hover:scale-110 transition-all shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-5 border-t border-slate-800 flex justify-end">
                        {/* COMPACT UPDATE: Slightly slimmer button py-2.5 */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex items-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 transform rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 mr-2 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Issue'
                            )}
                        </button>
                    </div>

                </form>
            </div>
            {popup.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className={`relative w-full max-w-sm p-8 text-center transition-all transform border shadow-2xl rounded-3xl bg-slate-900 ${popup.status === 'success' ? 'border-emerald-500/30 shadow-emerald-900/20' : 'border-rose-500/30 shadow-rose-900/20'}`}>
                        <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full border-4 ${popup.status === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'}`}>
                            {popup.status === 'success' ? (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h3 className={`text-2xl font-black mb-2 ${popup.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {popup.status === 'success' ? 'Success!' : 'Oops!'}
                        </h3>
                        <p className="mb-8 text-sm leading-relaxed text-slate-300">{popup.message}</p>
                        <button 
                            onClick={() => setPopup({ isOpen: false, status: '', message: '' })} 
                            className={`w-full py-3.5 font-bold tracking-widest uppercase transition-all duration-300 transform rounded-xl border border-transparent hover:-translate-y-0.5 ${popup.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]'}`}
                        >
                            {popup.status === 'success' ? 'Awesome' : 'Close'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RaiseIssue;  