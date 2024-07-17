import MemberLayout from "@/components/layouts/MemberLayouths"
import styles from "./Profile.module.scss"
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { uploadFile } from "@/lib/firebase/service";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import userServices from "@/services/user";
import { User } from "@/types/user.type";

type PropTypes = {
    profile: User | any,
    setProfile: Dispatch<SetStateAction<{}>>
    session: any
    setToaster: Dispatch<SetStateAction<{}>>
}

const ProfileMemberView = ({ profile, setProfile, session, setToaster }: PropTypes) => {
    const [isLoading, setIsLoading] = useState('')
    const [changeImage, setChangeImage] = useState<File | any>({})

    const handleChangeProfile = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading('profile');
        const form = document.getElementById("form-profile") as HTMLFormElement;
        const formData = new FormData(form);

        const data = {
            fullname: formData.get('fullname'),
            phone: formData.get('phone'),
        }
        const result = await userServices.updateProfile(data, session.data?.accessToken);
        if (result.status === 200) {
            setIsLoading('profile');
            setProfile({
                ...profile,
                fullname: formData.get('fullname'),
                phone: formData.get('phone'),
            })
            form.reset();
            setToaster({
                variant: 'success',
                message: 'Success Update profile'
            })
            setIsLoading('')
        } else {
            setIsLoading('');
        }

    }
    const handleChangeProfilePicture = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading('picture');
        const form = e.target as HTMLFormElement
        const file = form.image.files[0]
        if (file) {
            uploadFile(profile.id, file, async (status: string, newImageURL: string) => {
                if (status === 'success') {
                    const data = {
                        image: newImageURL
                    }
                    const result = await userServices.updateProfile(data, session.data?.accessToken);
                    if (result.status === 200) {
                        setIsLoading('');
                        setProfile({
                            ...profile,
                            image: newImageURL
                        })
                        setChangeImage({})
                        form.reset();
                        setToaster({
                            variant: 'success',
                            message: 'Success Change avatar'
                        })
                    } else {
                        setIsLoading('')
                        setChangeImage({})
                        setToaster({
                            variant: 'danger',
                            message: 'Error Connection'
                        })
                    }
                } else if (status === 'oversize') {
                    setIsLoading('');
                    setChangeImage({})
                    setToaster({
                        variant: 'danger',
                        message: 'Failed, picture is too large'
                    })
                } else {
                    setIsLoading('');
                    setChangeImage({})
                    setToaster({
                        variant: 'danger',
                        message: 'Failed Change avatar'
                    })
                }

            })
        }
    }
    const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading('password');
        const form = document.getElementById("form-password") as HTMLFormElement;
        const formData = new FormData(form);
        const data = {
            newPassword: formData.get('new-password'),
            oldPassword: formData.get('old-password'),
            encryptedPassword: profile.password
        }
        try {
            const result = await userServices.updateProfile(
                data,
                session.data?.accessToken);
            if (result.status === 200) {
                form.reset();
                setChangeImage({})
                setIsLoading('')
                setToaster({
                    variant: 'success',
                    message: 'Succes Change password'
                })
            }
        } catch (error) {
            setIsLoading('')
            setToaster({
                variant: 'danger',
                message: 'Failed Change Password'
            })
        }
    }
    return (
        <MemberLayout>
            <h1 className={styles.profile__title}>Profile Page</h1>
            <div className={styles.profile__main}>
                <div className={styles.profile__main__row}>
                    <div className={styles.profile__main__row__avatar}>
                        <h3>Avatar</h3>
                        {profile.image ?
                            (<Image src={profile.image} alt="profile" width={200} height={200} className={styles.profile__main__row__avatar__image} />) :
                            (<div className={styles.profile__main__row__avatar__image}>{profile?.fullname?.charAt(0)}</div>)
                        }
                        <form onSubmit={handleChangeProfilePicture}>
                            <label htmlFor="upload-image" className={styles.profile__main__row__avatar__label}>
                                {changeImage.name ?
                                    <p>{changeImage.name}</p> :
                                    <>
                                        <p>Upload a new Avatar, Larger image will be resized automatically</p>
                                        <p>Maximum upload size is <b>1 MB</b></p>
                                    </>
                                }
                            </label>
                            <input type="file" name="image" id="upload-image" className={styles.profile__main__row__avatar__input}
                                onChange={(e: any) => {
                                    e.preventDefault()
                                    setChangeImage(e.currentTarget.files[0])
                                }} />
                            <Button type="submit" className={styles.profile__main__row__avatar__button}>
                                {isLoading === 'picture' ? "Updating..." : "Update Avatar"}
                            </Button>
                        </form>
                    </div>
                    <div className={styles.profile__main__row__profile}>
                        <h3>Profile</h3>
                        <form onSubmit={handleChangeProfile} id="form-profile">
                            <Input name="fullname" defaultValue={profile.fullname} type="text" label="Fullname"></Input>
                            <Input name="phone" defaultValue={profile.phone} type="number" label="Phone" placholder="Input your phone"></Input>
                            <Input name="email" defaultValue={profile.email} type="email" label="Email" disabled></Input>
                            <Input name="role" defaultValue={profile.role} type="text" label="Role" disabled></Input>
                            <Button type="submit" variant="primary">
                                {isLoading === 'profile' ? "Updating..." : "Update Profile"}
                            </Button>
                        </form>
                    </div>
                    <div className={styles.profile__main__row__password}>
                        <h3>Change Password</h3>
                        <form onSubmit={handleChangePassword} id="form-password">
                            <Input name="old-password" type="password" label="Old Passsword" placholder="Enter your old password" disabled={profile.type === 'google'}></Input>
                            <Input name="new-password" type="password" label="New Passsword" placholder="Enter your new password" disabled={profile.type === 'google'}></Input>
                            <Button type="submit" variant="primary" disabled={isLoading === 'password' || profile.type === 'google'}>
                                {isLoading === 'password' ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </MemberLayout>
    )
}
export default ProfileMemberView