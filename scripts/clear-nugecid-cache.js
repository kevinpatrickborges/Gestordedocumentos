// Script para limpar cache relacionado ao NUGECID/Desarquivamentos
// Execute este script no console do navegador (F12 > Console)

console.log('🧹 Iniciando limpeza de cache do NUGECID/Desarquivamentos...');

// 1. Limpar localStorage
const localStorageKeys = Object.keys(localStorage);
const nugecidKeys = localStorageKeys.filter(key => 
  key.toLowerCase().includes('nugecid') || 
  key.toLowerCase().includes('desarquivamento') ||
  key.toLowerCase().includes('desarquiv')
);

console.log('🔍 Chaves encontradas no localStorage:', nugecidKeys);
nugecidKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`✅ Removido do localStorage: ${key}`);
});

// 2. Limpar sessionStorage
const sessionStorageKeys = Object.keys(sessionStorage);
const nugecidSessionKeys = sessionStorageKeys.filter(key => 
  key.toLowerCase().includes('nugecid') || 
  key.toLowerCase().includes('desarquivamento') ||
  key.toLowerCase().includes('desarquiv')
);

console.log('🔍 Chaves encontradas no sessionStorage:', nugecidSessionKeys);
nugecidSessionKeys.forEach(key => {
  sessionStorage.removeItem(key);
  console.log(`✅ Removido do sessionStorage: ${key}`);
});

// 3. Limpar cache do React Query (se disponível)
if (window.queryClient) {
  console.log('🔄 Invalidando cache do React Query...');
  
  // Invalidar queries relacionadas ao nugecid/desarquivamentos
  window.queryClient.invalidateQueries({ queryKey: ['nugecid'] });
  window.queryClient.invalidateQueries({ queryKey: ['desarquivamentos'] });
  window.queryClient.invalidateQueries({ queryKey: ['desarquivamento'] });
  
  // Remover queries específicas do cache
  window.queryClient.removeQueries({ queryKey: ['nugecid'] });
  window.queryClient.removeQueries({ queryKey: ['desarquivamentos'] });
  window.queryClient.removeQueries({ queryKey: ['desarquivamento'] });
  
  console.log('✅ Cache do React Query invalidado');
} else {
  console.log('⚠️ React Query não encontrado na janela global');
}

// 4. Limpar cache do navegador (se suportado)
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    const nugecidCaches = cacheNames.filter(name => 
      name.toLowerCase().includes('nugecid') || 
      name.toLowerCase().includes('desarquivamento')
    );
    
    console.log('🔍 Caches encontrados:', nugecidCaches);
    
    return Promise.all(
      nugecidCaches.map(cacheName => {
        console.log(`🗑️ Removendo cache: ${cacheName}`);
        return caches.delete(cacheName);
      })
    );
  }).then(() => {
    console.log('✅ Caches do navegador limpos');
  }).catch(err => {
    console.error('❌ Erro ao limpar caches:', err);
  });
} else {
  console.log('⚠️ Cache API não suportada neste navegador');
}

// 5. Forçar reload da página após limpeza
setTimeout(() => {
  console.log('🔄 Recarregando página para aplicar mudanças...');
  window.location.reload();
}, 2000);

console.log('✅ Limpeza de cache concluída! A página será recarregada em 2 segundos.');