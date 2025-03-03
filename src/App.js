import React, { useState, useEffect, useRef } from "react";
import LegalChatbot from "./LegalChatbot";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import "./App.css";
function App() {
    const canvasRef = useRef(null);
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Set initial size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Particle class
        class Particle {
            constructor(x, y, radius, color) {
                this.x = x;
                this.y = y;
                this.radius = radius;
                this.color = color;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        // Create particles
        const particles = [];
        const createParticles = () => {
            for (let i = 0; i < 200; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const radius = Math.random() * 1.5 + 0.5;
                const color = `rgba(200, 200, 200, ${Math.random() * 0.4 + 0.1})`;
                particles.push(new Particle(x, y, radius, color));
            }
        };

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        // Initial setup
        createParticles();
        animate();

        // Resize handler
        const handleResize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            particles.length = 0;
            createParticles();
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);
    return (
        // <div className="App">
        //     <div>
        //         <canvas id="dustCanvas" class="w-100" ref={canvasRef}></canvas>
        //         <nav className=" w-screen flex justify-center relative mx-auto bg-slate-950" >
        //             <div className="card example-2">
        //                 <div className="inner ">
        //                     <ul className="flex gap-18 text-slate-500 font-medium mt-3 ">
        //                         <li className="hover:text-slate-300 hover:opacity-90 transition-colors duration-100">Home</li>
        //                         <li className="hover:text-slate-300 hover:opacity-90 transition-colors duration-100">Services</li>
        //                         <li className="hover:text-slate-300 hover:opacity-90 transition-colors duration-100">Portfolio</li>
        //                     </ul>
        //                 </div>
        //             </div>
        //         </nav>
        //         {/* <!-- Hero Section --> */}
        //         <div id="hero-section">
        //             <div class="hero-title mx-auto text-center px-5 pt-5">
        //                 <h1 class="hero-heading px-5">AI POWERED LEGAL ASSISTANT, Tomorrow’s
        //                     Innovation. </h1>
        //                 <div class="hero-subtitle mt-3">
        //                     <p class="mb-0 hero-subheading">Crafting Digital Excellence for a
        //                         Better Future </p>
        //                     {/* <p class="mb-0 hero-subheading">Beyond Imagination.</p> */}
        //                 </div>
        //             </div>
        //             <div class="scroll-down">
        //                 <div class="chevron"></div>
        //                 <div class="chevron"></div>
        //                 <div class="chevron"></div>
        //                 <span class="text">Scroll down</span>
        //             </div>
        //         </div>
        //         <div className="h-[40rem]">
        // <div>
        //     <h1>AI-Driven Legal Assistant Chatbot</h1>
        //     <SessionManager setSessionId={handleNewSession} />
        //     {sessionId && (
        //         <>
        //             <FileUploader sessionId={sessionId} onUploadSuccess={() => setFileProcessed(true)} />
        //             {fileProcessed && <QuestionAsker sessionId={sessionId} />}
        //         </>
        //     )}
        // </div>
        //         </div>
        //         {/* <!-- Footer section --> */}
        // <div class="container">
        //     <footer class="row row-cols-1 row-cols-sm-2 row-cols-md-5 pt-5 pb-1 my-0 border-top">
        //         <div class="col mb-3">
        //             <a href="/" class="d-flex align-items-center mb-3 link-dark text-decoration-none">
        //                 <svg class="bi me-2" width="40" height="32">
        //                     <use xlinkHref="#bootstrap"></use>
        //                 </svg>
        //             </a>
        //         </div>

        //         <div class="col mb-3">

        //         </div>

        //         <div class="col mb-3">
        //             <ul class="nav flex-column">
        //                 <li class="nav-item mb-2"><p class="nav-link p-0 text-muted text-center">Developed with &hearts; </p></li>
        //                 <li class="nav-item mb-2"><a href="https://github.com/parthgupta49/" target="_blank" rel="noreferrer" class="nav-link text-center p-0 text-muted">Parth Gupta </a></li>
        //             </ul>
        //         </div>
        //     </footer>
        // </div>
        //     </div>
        // </div>
        <Router>
            <div className="App">
                <div>
                    <canvas id="dustCanvas" className="w-100" ref={canvasRef}></canvas>
                    <nav className="w-screen flex justify-center relative mx-auto bg-slate-950">
                        <div className="card example-2">
                            <div className="inner">
                                <ul className="flex gap-18 text-slate-500 font-medium mt-3">
                                    <li className=" hover:text-slate-300 hover:opacity-90 transition-colors duration-100">
                                        <Link to="/" className="px-4 py-2">Home</Link>
                                    </li>
                                    <li className=" hover:text-slate-300 hover:opacity-90 transition-colors duration-100">
                                        <Link to="/chatbot" className="px-4 py-2">Legal Assistant</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>

                    <Routes>
                        <Route path="/" element={
                            <div className="h-[40rem]">
                                <div id="hero-section">
                                    <div className="hero-title mx-auto text-center px-5 pt-5">
                                        <h1 className="hero-heading px-5 text-4xl font-bold">
                                            AI POWERED LEGAL ASSISTANT
                                        </h1>
                                        <div className="hero-subtitle mt-3">
                                            <p className="mb-0 hero-subheading text-xl">
                                                Simplifying Legal Processes Through AI
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        } />
                        <Route path="/chatbot" element={<LegalChatbot />} />
                    </Routes>

                    {/* Footer section */}
                    <div className="container z-10 absolute">
                        <footer className="row row-cols-1 row-cols-sm-2 row-cols-md-5 pt-5 pb-1 my-0">
                            <div className="col mb-3">
                                <ul className="nav flex-column">
                                    <li className="nav-item mb-2 text-center">
                                        <span className="text-muted">Developed with ❤️ by Parth Gupta</span>
                                    </li>
                                </ul>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </Router>
    );
}
export default App;