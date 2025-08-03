"use client";
import { useState } from "react";
import WidthWrapper from './components/WidthWrapper';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from './components/ui/form';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { signUpSchema } from "../../schemas/auth/signUpSchema";
import { useDebounceCallback } from 'usehooks-ts';

const SignUp = () => {
    const [username, setUsername] = useState("");
    const [usernameMessgae, setUsernameMessage] = useState("");
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const debounced = useDebounceCallback(setUsername, 300);
    const router = useRouter();

    // zod implementation
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            fullName: "",
            username: "",
            email: "",
            contact: "",
            password: "",
            confirmPassword: ""
        }
    });

    return (
        <section>

        </section>
    );
};

export default SignUp;
