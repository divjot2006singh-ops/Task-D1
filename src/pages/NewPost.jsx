import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
addDoc,
collection,
serverTimestamp
} from "firebase/firestore";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import "../App.css";

function NewPost() {
const navigate = useNavigate();
const { user, loading } = useAuth();

const [postType, setPostType] = useState("Question");
const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [abstract, setAbstract] = useState("");
const [articleText, setArticleText] = useState("");
const [tags, setTags] = useState("");
const [error, setError] = useState("");
const [submitting, setSubmitting] = useState(false);
const [success, setSuccess] = useState("");

async function handlePost(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (loading) {
        setError("Please wait while your account is loading.");
        return;
    }

    if (!user) {
        navigate("/login");
        return;
    }

    const tagList = tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");

    if (!title.trim()) {
        setError("Please enter a title.");
        return;
    }

    if (
        postType === "Question" &&
        !description.trim()
    ) {
        setError("Please describe your problem.");
        return;
    }

    if (
        postType === "Article" &&
        (!abstract.trim() || !articleText.trim())
    ) {
        setError("Please enter the abstract and article text.");
        return;
    }

    if (tagList.length === 0) {
        setError("Please enter at least one tag.");
        return;
    }

    if (tagList.length > 3) {
        setError("You can enter a maximum of 3 tags.");
        return;
    }

    setSubmitting(true);

    try {
        const postData = {
            postType,
            title: title.trim(),
            description: postType === "Question"
                ? description.trim()
                : "",
            abstract: postType === "Article"
                ? abstract.trim()
                : "",
            articleText: postType === "Article"
                ? articleText.trim()
                : "",
            tags: tagList,
            authorId: user.uid,
            authorName: user.displayName || user.email || "User",
            authorEmail: user.email || "",
            createdAt: serverTimestamp()
        };

        // Save the post in the Firestore "posts" collection.
        await addDoc(collection(db, "posts"), postData);

        setSuccess("Your post has been saved successfully!");

        setTitle("");
        setDescription("");
        setAbstract("");
        setArticleText("");
        setTags("");
        setPostType("Question");
    } catch (err) {
        console.error("Failed to save post:", err);
        setError(
            "Unable to save your post. Please check your connection and Firestore permissions, then try again."
        );
    } finally {
        setSubmitting(false);
    }
}

return (
    <>
        <Header />

        <main className="post-container">
            <h2 className="post-heading">New Post</h2>

            {!loading && !user && (
                <p role="status">
                    Please log in to create a post.
                </p>
            )}

            <div className="post-type">
                <span>Select Post Type:</span>

                <label>
                    <input
                        type="radio"
                        name="postType"
                        checked={postType === "Question"}
                        onChange={() => {
                            setPostType("Question");
                            setError("");
                            setSuccess("");
                        }}
                        disabled={submitting}
                    />
                    Question
                </label>

                <label>
                    <input
                        type="radio"
                        name="postType"
                        checked={postType === "Article"}
                        onChange={() => {
                            setPostType("Article");
                            setError("");
                            setSuccess("");
                        }}
                        disabled={submitting}
                    />
                    Article
                </label>
            </div>

            <h3 className="post-section-heading">
                What do you want to ask or share?
            </h3>

            <form onSubmit={handlePost}>
                <div className="post-field">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        placeholder={
                            postType === "Question"
                                ? "Start your question with how, what, why, etc."
                                : "Enter a descriptive title"
                        }
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        disabled={submitting}
                        style={{ width: "75%" }}
                    />
                </div>

                {postType === "Question" ? (
                    <div className="post-field post-description">
                        <label htmlFor="description">
                            Describe your problem
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                            disabled={submitting}
                        />
                    </div>
                ) : (
                    <>
                        <div className="post-field">
                            <label htmlFor="abstract">Abstract</label>
                            <textarea
                                id="abstract"
                                placeholder="Enter a 1-paragraph abstract"
                                value={abstract}
                                onChange={e => setAbstract(e.target.value)}
                                required
                                disabled={submitting}
                            />
                        </div>

                        <div className="post-field post-description">
                            <label htmlFor="articleText">
                                Article Text
                            </label>
                            <textarea
                                id="articleText"
                                value={articleText}
                                onChange={e => setArticleText(e.target.value)}
                                required
                                disabled={submitting}
                            />
                        </div>
                    </>
                )}

                <div className="post-field post-tags">
                    <label htmlFor="tags">Tags</label>
                    <input
                        id="tags"
                        type="text"
                        placeholder="Enter up to 3 tags, separated by commas"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        required
                        disabled={submitting}
                    />
                </div>

                {error && (
                    <p className="post-error" role="alert">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="upgrade-success" role="status">
                        {success}
                    </p>
                )}

                <button
                    type="submit"
                    className="post-submit"
                    disabled={submitting || loading || !user}
                >
                    {submitting ? "Saving Post..." : "Post"}
                </button>
            </form>
        </main>

        <Footer />
    </>
);

}

export default NewPost;
