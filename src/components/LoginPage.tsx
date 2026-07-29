 import React, { useState } from 'react';
 import { useAuth } from '../contexts/AuthContext';
 import { Sparkles, Phone, Lock, Loader2 } from 'lucide-react';
 
 type AuthMode = 'login' | 'register';
 
 export const LoginPage: React.FC = () => {
   const { signIn, signUp } = useAuth();
   const [mode, setMode] = useState<AuthMode>('login');
   const [phone, setPhone] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState<string | null>(null);
   const [submitting, setSubmitting] = useState(false);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError(null);
 
     if (!phone.trim() || !password.trim()) {
       setError('请填写手机号和密码');
       return;
     }
 
     // 简单手机号格式校验
     const phoneClean = phone.trim();
     if (phoneClean.length < 8) {
       setError('请输入有效的手机号');
       return;
     }
 
     if (password.length < 6) {
       setError('密码至少需要 6 位');
       return;
     }
 
     setSubmitting(true);
 
     let result;
     if (mode === 'login') {
       result = await signIn(phoneClean, password);
     } else {
       result = await signUp(phoneClean, password);
     }
 
     setSubmitting(false);
 
     if (result.error) {
       if (result.error.message?.includes('already')) {
         setError('该手机号已注册，请直接登录');
       } else if (result.error.message?.includes('Invalid')) {
         setError('手机号或密码错误');
       } else {
         setError(result.error.message || '操作失败，请重试');
       }
     } else if (mode === 'register') {
       setMode('login');
       setError('注册成功，请登录');
     }
   };
 
   return (
     <div className="min-h-screen bg-[#faf9f5] text-[#1b1c1a] flex flex-col max-w-md mx-auto">
       {/* 顶部装饰区 */}
       <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
         {/* Logo / Brand */}
         <div className="mb-8 text-center">
           <div className="w-16 h-16 rounded-3xl bg-[#1b1c1a] flex items-center justify-center mx-auto mb-4 shadow-lg">
             <Sparkles className="w-8 h-8 text-[#95f7bb]" />
           </div>
           <h1 className="text-3xl font-bold tracking-tight text-[#1b1c1a]">MindFlow</h1>
           <p className="text-sm text-[#747878] mt-1.5 font-medium">极简心流笔记</p>
         </div>
 
         {/* 认证表单 */}
         <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-[#efeeea]">
           {/* Mode 切换 Tab */}
           <div className="flex mb-6 bg-[#f4f4f0] rounded-xl p-1">
             <button
               onClick={() => { setMode('login'); setError(null); }}
               className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                 mode === 'login'
                   ? 'bg-white text-[#1b1c1a] shadow-sm'
                   : 'text-[#747878] hover:text-[#1b1c1a]'
               }`}
             >
               登录
             </button>
             <button
               onClick={() => { setMode('register'); setError(null); }}
               className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                 mode === 'register'
                   ? 'bg-white text-[#1b1c1a] shadow-sm'
                   : 'text-[#747878] hover:text-[#1b1c1a]'
               }`}
             >
               注册
             </button>
           </div>
 
           {/* 表单 */}
           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label className="block text-xs font-semibold text-[#747878] mb-1.5 ml-1">手机号</label>
               <div className="relative">
                 <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747878]" />
                 <input
                   type="tel"
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                   placeholder="请输入手机号"
                   className="w-full h-11 pl-10 pr-4 bg-[#f4f4f0] border-none rounded-xl text-sm font-medium text-[#1b1c1a] focus:ring-2 focus:ring-[#1b1c1a]/10 placeholder:text-[#747878]"
                   disabled={submitting}
                 />
               </div>
             </div>
 
             <div>
               <label className="block text-xs font-semibold text-[#747878] mb-1.5 ml-1">密码</label>
               <div className="relative">
                 <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747878]" />
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="请输入密码"
                   className="w-full h-11 pl-10 pr-4 bg-[#f4f4f0] border-none rounded-xl text-sm font-medium text-[#1b1c1a] focus:ring-2 focus:ring-[#1b1c1a]/10 placeholder:text-[#747878]"
                   disabled={submitting}
                 />
               </div>
             </div>
 
             {error && (
               <div className={`text-xs font-medium px-3 py-2 rounded-xl ${
                 error.includes('成功')
                   ? 'bg-[#e8f8ee] text-[#006d41]'
                   : 'bg-[#ffdad6] text-[#ba1a1a]'
               }`}>
                 {error}
               </div>
             )}
 
             <button
               type="submit"
               disabled={submitting}
               className="w-full h-12 bg-[#1b1c1a] text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
             >
               {submitting ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin text-[#95f7bb]" />
                   <span>{mode === 'login' ? '登录中...' : '注册中...'}</span>
                 </>
               ) : (
                 <span>{mode === 'login' ? '登录' : '注册'}</span>
               )}
             </button>
           </form>
         </div>
 
         <p className="text-[11px] text-[#747878] mt-6 text-center leading-relaxed">
           登录即表示同意使用条款<br />
           无需短信验证，手机号 + 密码即可使用
         </p>
       </div>
     </div>
   );
 };
