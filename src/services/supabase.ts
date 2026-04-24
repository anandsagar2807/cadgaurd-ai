import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth API
export const authApi = {
  signUp: async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  getSession: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthStateChange: (callback: (user: any) => void) => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
    return data.subscription;
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  },

  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  },
};

// Projects table API
export const projectsApi = {
  list: async (userId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  get: async (id: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (userId: string, projectData: any) => {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        ...projectData,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  },
};

// Validations table API
export const validationsApi = {
  list: async (projectId: string) => {
    const { data, error } = await supabase
      .from('validations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  get: async (id: string) => {
    const { data, error } = await supabase
      .from('validations')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (projectId: string, validationData: any) => {
    const { data, error } = await supabase
      .from('validations')
      .insert({
        project_id: projectId,
        ...validationData,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('validations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('validations')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Analytics/Content Storage API
export const contentApi = {
  getPageContent: async (page: string, userId?: string) => {
    let query = supabase
      .from('page_content')
      .select('*')
      .eq('page_name', page);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  savePageContent: async (page: string, content: any, userId?: string) => {
    const { data, error } = await supabase
      .from('page_content')
      .insert({
        page_name: page,
        content,
        user_id: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updatePageContent: async (id: string, content: any) => {
    const { data, error } = await supabase
      .from('page_content')
      .update({ content })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
