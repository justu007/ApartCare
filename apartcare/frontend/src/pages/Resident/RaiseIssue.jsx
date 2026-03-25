// import  { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { createIssue } from '../../api/user';

// const RaiseIssue = () => {
//     const navigate = useNavigate();


//     const [title, setTitle] = useState('');
//     const [description, setDescription] = useState('');
//     const [category, setCategory] = useState('Other'); 
//     const [priority, setPriority] = useState('Low');  
    

//     const [images, setImages] = useState([]);

//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState('');
//     const [error, setError] = useState('');

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');
//         setMessage('');

//         try {
            
//             const formBox = new FormData();
            
           
//             formBox.append('title', title);
//             formBox.append('description', description);
//             formBox.append('category', category);
//             formBox.append('priority', priority);

           
//             images.forEach((imageFile) => {
//                 formBox.append('images', imageFile);
//             });

            
//             const response = await createIssue(formBox) ;

//             setMessage("Issue raised successfully! Admin has been notified.");
            
            
//             setTitle('');
//             setDescription('');
//             setCategory('Other');
//             setPriority('Low');
//             setImages([]); 

//         } catch (err) {
//             console.error(err);
//             setError(err.response?.data?.detail || "Failed to submit issue. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };  

//     return (
//         <div className="max-w-2xl p-6 mx-auto mt-10 bg-white rounded-lg shadow-md">
//             <h2 className="mb-6 text-2xl font-bold text-gray-800">Raise a Maintenance Issue</h2>
            
//             {/* Feedback Banners */}
//             {message && <div className="p-4 mb-6 text-green-700 bg-green-100 rounded-md">{message}</div>}
//             {error && <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-md">{error}</div>}

//             <form onSubmit={handleSubmit} className="space-y-6">
                
//                 {/* TITLE INPUT */}
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700">Issue Title</label>
//                     <input 
//                         type="text" 
//                         required
//                         placeholder="E.g., Broken pipe in kitchen"
//                         value={title} 
//                         onChange={(e) => setTitle(e.target.value)} 
//                         className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                     />
//                 </div>

//                 {/* CATEGORY & PRIORITY DROPDOWNS (Side by Side) */}
//                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Category</label>
//                         <select 
//                             value={category} 
//                             onChange={(e) => setCategory(e.target.value)}
//                             className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                         >
//                             <option value="Plumbing">Plumbing</option>
//                             <option value="Electrical">Electrical</option>
//                             <option value="Cleaning">Cleaning</option>
//                             <option value="Security">Security</option>
//                             <option value="Other">Other</option>
//                         </select>
//                     </div>

//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Priority</label>
//                         <select 
//                             value={priority} 
//                             onChange={(e) => setPriority(e.target.value)}
//                             className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                         >
//                             <option value="Low">Low (Can wait a few days)</option>
//                             <option value="Medium">Medium (Needs attention soon)</option>
//                             <option value="High">High (Impacting daily life)</option>
//                             <option value="Urgent">Urgent (Emergency / Safety Hazard)</option>
//                         </select>
//                     </div>
//                 </div>

//                 {/* DESCRIPTION INPUT */}
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
//                     <textarea 
//                         required
//                         rows="4"
//                         placeholder="Please provide as many details as possible..."
//                         value={description} 
//                         onChange={(e) => setDescription(e.target.value)} 
//                         className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                     ></textarea>
//                 </div>
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700">Attach Photos (Optional)</label>
//                     <input 
//                         type="file" 
//                         multiple 
//                         accept="image/*" 
//                         onChange={(e) => {
                            
//                             setImages(Array.from(e.target.files));
//                         }}
//                         className="w-full p-2 mt-1 border border-gray-300 rounded-md"
//                     />
                    
                  
//                     {images.length > 0 && (
//                         <p className="mt-2 text-sm text-blue-600 font-medium">
//                             {images.length} photo(s) selected and ready to upload.
//                         </p>
//                     )}
//                 </div>




//                 {/* SUBMIT BUTTON */}
//                 <div className="flex justify-end">
//                     <button 
//                         type="submit" 
//                         disabled={loading}
//                         className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
//                     >
//                         {loading ? 'Submitting...' : 'Submit Issue'}
//                     </button>
//                 </div>

//             </form>
//         </div>
//     );
// };

// export default RaiseIssue;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIssue } from '../../api/user'; // Adjust path if needed

const RaiseIssue = () => {
    const navigate = useNavigate();

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

            setMessage("Success! Your issue has been submitted to the administration.");
            
            setTitle('');
            setDescription('');
            setCategory('Plumbing');
            setImages([]); 

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to submit issue. Please try again.");
        } finally {
            setLoading(false);
        }
    };  

    return (
        <div className="max-w-3xl p-8 mx-auto mt-10 transition-all duration-300 bg-white border border-gray-100 shadow-2xl rounded-2xl">
            
            <div className="pb-6 mb-8 border-b border-gray-100">
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Report an Issue
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                    Help us keep the community in top shape. Describe the problem below, and our team will get it sorted.
                </p>
            </div>
            
            {message && (
                <div className="flex items-center p-4 mb-6 text-green-800 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                    <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="font-medium">{message}</span>
                </div>
            )}
            {error && (
                <div className="flex items-center p-4 mb-6 text-red-800 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <svg className="w-6 h-6 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* TITLE INPUT */}
                    <div className="md:col-span-1">
                        <label className="block mb-2 text-sm font-semibold text-gray-700">Issue Title</label>
                        <input 
                            type="text" 
                            required
                            placeholder="E.g., Broken pipe in the kitchen"
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            className="w-full p-3 transition-all duration-200 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* CATEGORY DROPDOWN */}
                    <div className="md:col-span-1">
                        <label className="block mb-2 text-sm font-semibold text-gray-700">Category</label>
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-3 transition-all duration-200 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
                        >
                            <option value="Plumbing">Plumbing</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Cleaning">Cleaning</option>
                            <option value="Security">Security</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {/* DESCRIPTION INPUT */}
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Detailed Description</label>
                    <textarea 
                        required
                        rows="4"
                        placeholder="Please provide as many details as possible to help our staff locate and fix the issue quickly..."
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        className="w-full p-4 transition-all duration-200 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    ></textarea>
                </div>

                {/* --- BEAUTIFUL FILE DROPZONE --- */}
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Attach Photos (Optional)</label>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex flex-col items-center justify-center pt-3 pb-2">
                                <svg className="w-10 h-10 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-400">PNG, JPG, JPEG (Max 5MB each)</p>
                            </div>
                            <input id="dropzone-file" type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                    </div>

                    {/* --- RICH IMAGE THUMBNAIL PREVIEWS --- */}
                    {images.length > 0 && (
                        <div className="mt-6">
                            <p className="mb-3 text-sm font-medium text-gray-700">Ready to upload ({images.length})</p>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative group">
                                        {/* URL.createObjectURL creates a temporary link to show the image instantly! */}
                                        <img 
                                            src={URL.createObjectURL(img)} 
                                            alt={`Preview ${index}`} 
                                            className="block object-cover w-full h-24 rounded-lg shadow-sm"
                                        />
                                        <div className="absolute inset-0 transition-opacity duration-200 bg-black bg-opacity-40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                            <button 
                                                type="button" 
                                                onClick={() => removeImage(index)}
                                                className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                                title="Remove image"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* PREMIUM SUBMIT BUTTON */}
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex items-center px-8 py-3.5 font-bold text-white transition-all duration-200 transform rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? (
                            <>
                                <svg className="w-5 h-5 mr-3 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Submitting...
                            </>
                        ) : (
                            'Submit Issue'
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default RaiseIssue;