'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import type { TInvoiceFormErrors } from './schemas';

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: TCreateInvoiceInput) => {
      const response = await fetch('/api/invoices', {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const json = await response.json();

      if (!response.ok) throw json;

      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      router.push('/dashboard/invoices');
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: TUpdateInvoiceInput) => {
      const response = await fetch('/api/invoices', {
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      });

      const json = await response.json();

      if (!response.ok) throw json;

      return json;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      router.push('/dashboard/invoices');
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });

      const json = await response.json();

      if (!response.ok) throw json;

      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

/* Types */
type TCreateInvoiceInput = {
  amount: number;
  customerId: string;
  status: string;
};

type TUpdateInvoiceInput = TCreateInvoiceInput & {
  id: string;
};

export type TMutationError = {
  errors?: TInvoiceFormErrors;
  message?: string;
};
