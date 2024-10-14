import { createContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateEmail,
    updatePassword,
    updateProfile,
} from "firebase/auth";
import { app } from "../firebase/firebase.config";
import useAxiosUser from "../Hooks/useAxiosUser";

export const AuthContext = createContext(null);

const auth = getAuth(app);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const axiosUser = useAxiosUser();

    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    };

    const updateUserProfile = (name, age) => {
        return updateProfile(auth.currentUser, {
            displayName: name,
            age,
        });
    };

    const updateUserEmail = (newEmail) => {
        return updateEmail(auth.currentUser, newEmail);
    };

    const updateUserPassword = (newPassword) => {
        return updatePassword(auth.currentUser, newPassword);
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            console.log('current user', currentUser);

            if (currentUser) {
                // Get token and store client
                const userInfo = { email: currentUser.email };
                axiosUser
                    .post("/jwt", userInfo)
                    .then((res) => {
                        if (res.data.token) {
                            // console.log(res.data.token)
                            localStorage.setItem("access-token", res.data.token);
                        }
                    })
                    .catch((error) => {
                        console.error("Error fetching token:", error);
                    });
            } else {
                // Remove token (if token stored in the client side, local storage, caching, in memory)
                localStorage.removeItem("access-token");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [axiosUser]); // Ensure axiosUser is stable

    const authInfo = {
        user,
        loading,
        createUser,
        signIn,
        logOut,
        updateUserProfile,
        updateUserEmail,
        updateUserPassword
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
