import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { object, string } from 'yup';

import LoginFormContainer from '@/components/auth/LoginFormContainer';
import Button from '@/components/elements/Button';
import Captcha, { getCaptchaResponse } from '@/components/elements/Captcha';
import Field from '@/components/elements/Field';
import Logo from '@/components/elements/HLogo';

import CaptchaManager from '@/lib/captcha';

import login from '@/api/auth/login';

import useFlash from '@/plugins/useFlash';

interface Values {
    user: string;
    password: string;
}

function LoginContainer() {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const navigate = useNavigate();

    useEffect(() => {
        clearFlashes();
    }, []);

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        // Get captcha response if enabled
        let loginData: any = values;
        if (CaptchaManager.isEnabled()) {
            const captchaResponse = getCaptchaResponse();
            const fieldName = CaptchaManager.getProviderInstance().getResponseFieldName();

            console.log('Captcha enabled, response:', captchaResponse, 'fieldName:', fieldName);

            if (fieldName) {
                if (captchaResponse) {
                    loginData = { ...values, [fieldName]: captchaResponse };
                    console.log('Adding captcha to login data:', loginData);
                } else {
                    // Captcha is enabled but no response - show error
                    console.error('Captcha enabled but no response available');
                    clearAndAddHttpError({ error: new Error('Veuillez compléter la vérification captcha.') });
                    setSubmitting(false);
                    return;
                }
            }
        } else {
            console.log('Captcha not enabled');
        }

        login(loginData)
            .then((response) => {
                if (response.complete) {
                    window.location.href = response.intended || '/';
                    return;
                }
                navigate('/auth/login/checkpoint', { state: { token: response.confirmationToken } });
            })
            .catch((error: any) => {
                setSubmitting(false);

                if (error.code === 'InvalidCredentials') {
                    clearAndAddHttpError({
                        error: new Error("Nom d'utilisateur ou mot de passe invalide. Veuillez réessayer."),
                    });
                } else if (error.code === 'DisplayException') {
                    clearAndAddHttpError({ error: new Error(error.detail || error.message) });
                } else {
                    clearAndAddHttpError({ error });
                }
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ user: '', password: '' }}
            validationSchema={object().shape({
                user: string().required("Un nom d'utilisateur ou un email doit être fourni."),
                password: string().required('Veuillez entrer le mot de passe de votre compte.'),
            })}
        >
            {({ isSubmitting }) => (
                <LoginFormContainer
                    className={`w-full flex bg-[#0A0B0D] border border-white/10 hover:border-white/20 shadow-lg rounded-xl px-8 py-10 transition-all`}
                >
                    <div className='flex h-12 mb-4 items-center justify-center w-full'>
                        <Logo />
                    </div>
                    <div aria-hidden className='my-8 bg-[#ffffff33] min-h-[1px]'></div>
                    <h2 className='text-xl font-extrabold mb-2'>Connexion</h2>

                    <Field id='user' type={'text'} label={'Email'} name={'user'} disabled={isSubmitting} />

                    <div className={`relative mt-6`}>
                        <Field
                            id='password'
                            type={'password'}
                            label={'Password'}
                            name={'password'}
                            disabled={isSubmitting}
                        />
                        <Link
                            to={'/auth/password'}
                            className={`text-xs text-zinc-500 tracking-wide no-underline hover:text-zinc-600 absolute top-1 right-0`}
                        >
                            Mot de passe oublié?
                        </Link>
                    </div>

                    <Captcha
                        className='mt-6'
                        onError={(error) => {
                            console.error('Captcha error:', error);
                            clearAndAddHttpError({
                                error: new Error('Captcha verification failed. Please try again.'),
                            });
                        }}
                    />

                    <div className={`mt-6`}>
                        <Button
                            className={`relative mt-4 w-full rounded-full bg-brand border-0 ring-0 outline-hidden capitalize font-bold text-sm py-2 hover:cursor-pointer`}
                            type={'submit'}
                            size={'xlarge'}
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Se connecter
                        </Button>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
}

export default LoginContainer;
