import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/api';

export function useAuth() {
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const payload = response?.data?.data;
      localStorage.setItem('smartlink_token', payload.token);
      localStorage.setItem('smartlink_user', JSON.stringify(payload.user));
    }
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      const payload = response?.data?.data;
      localStorage.setItem('smartlink_token', payload.token);
      localStorage.setItem('smartlink_user', JSON.stringify(payload.user));
    }
  });

  return { loginMutation, registerMutation };
}
