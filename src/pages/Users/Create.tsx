import React from 'react';
import { User } from '../../models/User';
import UserFormValidator from '../../components/users/UserFormValidator';
import Swal from 'sweetalert2';
import { userService } from "../../services/userService";
import Breadcrumb from '../../components/Breadcrumb';
import { useNavigate } from "react-router-dom";

const CreateUserPage = () => {
    const navigate = useNavigate();

    const handleCreateUser = async (user: User) => {
        try {
            const createdUser = await userService.createUser(user);
            if (createdUser) {
                Swal.fire({
                    title: "Completado",
                    text: "Se ha creado correctamente el usuario",
                    icon: "success",
                    timer: 3000
                })
                console.log("Usuario creado con éxito:", createdUser);
                navigate("/users/list");
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Existe un problema al crear el usuario",
                    icon: "error",
                    timer: 3000
                })
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Error al crear el usuario";
            Swal.fire({
                title: "Error",
                text: errorMessage,
                icon: "error",
                timer: 3000
            })
        }
    };

    return (
        <div>
            <Breadcrumb pageName="Crear Usuario" />
            <UserFormValidator
                handleAction={handleCreateUser}
                mode={1}
            />
        </div>
    );
};

export default CreateUserPage;

