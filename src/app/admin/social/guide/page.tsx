import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BOARDS, GROUP_SETUP, MESSENGER, PROFILE } from "@/content/social";
import { requireAdminPage } from "@/lib/admin-guard";
import { site } from "@/lib/content";
import { supabaseAdmin } from "@/lib/supabase";
import AdminNav from "../../AdminNav";
import { toggleDone } from "../actions";
import CopyBlock from "../CopyBlock";

export const metadata: Metadata = { title: "Guia de divulgação", robots: { index: false, follow: false } };

export default function GuidePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-20 text-muted sm:px-8">Carregando…</div>}>
      <Guide />
    </Suspense>
  );
}

const SITE = site.site_url.replace(/\/$/, "");
const withSite = (s: string) => s.replaceAll("{site}", SITE);

async function Guide() {
  await requireAdminPage();
  const db = supabaseAdmin();
  const { data } = db ? await db.from("social_done").select("key").like("key", "guide:%") : { data: [] as { key: string }[] };
  const done = new Set((data ?? []).map((r) => r.key));

  const Step = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => {
    const key = `guide:${id}`;
    const ok = done.has(key);
    return (
      <section className={`border bg-white p-6 ${ok ? "border-sage/60" : "border-line"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="font-serif text-2xl">{ok ? "✓ " : ""}{title}</h3>
          <form action={toggleDone}>
            <input type="hidden" name="key" value={key} />
            <input type="hidden" name="done" value={ok ? "0" : "1"} />
            <button className={`border px-3 py-1.5 text-sm ${ok ? "border-sage bg-sage text-white" : "border-line hover:bg-linen"}`}>
              {ok ? "Feito ✓" : "Marcar como feito"}
            </button>
          </form>
        </div>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">{children}</div>
      </section>
    );
  };

  const steps = ["page", "business-suite", "messenger", "group", "pinterest", "pinterest-claim", "instagram", "site-links"];
  const count = steps.filter((s) => done.has(`guide:${s}`)).length;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-8">
      <AdminNav current="/admin/social" title="Guia de divulgação">
        <Link href="/admin/social" className="btn btn-ink !py-2.5">Posts do dia</Link>
      </AdminNav>

      <p className="mt-6 text-sm text-muted">
        Configuração feita uma vez só: {count} de {steps.length} passos prontos. Os textos em inglês são para copiar e colar.
      </p>

      <h2 className="mt-10 text-3xl">1. Configurar (uma vez)</h2>
      <div className="mt-5 space-y-5">
        <Step id="page" title="Criar a Página do Facebook">
          <p>
            Grupos e perfis pessoais não podem ter respostas automáticas nem agendamento pelo Business Suite. A Página pode. Crie em{" "}
            <a className="underline" href="https://www.facebook.com/pages/create" target="_blank" rel="noopener noreferrer">facebook.com/pages/create</a>:
            nome <b>Elonai</b>, categoria <b>Religious Organization</b>.
          </p>
          <CopyBlock label="Bio da Página" text={PROFILE.pageBio} />
          <CopyBlock label="Site (com rastreio)" text={`${SITE}/?utm_source=facebook&utm_campaign=page-bio`} />
          <p>
            Foto de perfil: <a className="underline" href={`${SITE}/logo-mark.png`} target="_blank" rel="noopener noreferrer">logo</a>. Capa:{" "}
            <a className="underline" href={`${SITE}/images/hero-home.jpg`} target="_blank" rel="noopener noreferrer">imagem do site</a>.
            Adicione o botão <b>Send message</b>. Depois, no seu grupo, em Configurações, adicione a Página como administradora para
            poder postar no grupo como Elonai.
          </p>
        </Step>

        <Step id="business-suite" title="Conectar o Meta Business Suite">
          <p>
            Em <a className="underline" href="https://business.facebook.com" target="_blank" rel="noopener noreferrer">business.facebook.com</a>, conecte a
            Página e o Instagram. No <b>Planejador</b> você agenda os posts da Página e do Instagram da semana inteira de uma vez: escolha o dia e o
            horário, cole o texto, suba a imagem e marque as duas contas.
          </p>
          <p>
            O link vai sempre no <b>primeiro comentário</b>: o Facebook mostra menos posts com link no texto e está testando um limite de links por mês para
            Páginas. Links em comentários não contam nesse limite.
          </p>
        </Step>

        <Step id="messenger" title="Respostas automáticas do Messenger">
          <p>No Business Suite: <b>Caixa de entrada → Automações</b>. Ative estas e desligue a “mensagem de ausência” (ela tem prioridade e bloqueia as outras).</p>
          <CopyBlock label="Saudação do Messenger" text={MESSENGER.greeting} />
          <CopyBlock label="Resposta instantânea" text={withSite(MESSENGER.instant)} />
          <p>Perguntas frequentes (aparecem como botões para a pessoa tocar):</p>
          {MESSENGER.faqs.map((f) => (
            <div key={f.q} className="grid gap-2 sm:grid-cols-2">
              <CopyBlock label="Pergunta" text={f.q} />
              <CopyBlock label="Resposta" text={withSite(f.a)} />
            </div>
          ))}
          <p>Os links de doação e do grupo passam pelo site (/donate e /join), então seguem o que estiver salvo nas Configurações do painel.</p>
        </Step>

        <Step id="group" title="Arrumar o seu grupo">
          <p>No grupo: <b>Gerenciar → Configurações</b>. Deixe o grupo privado e com aprovação de membros.</p>
          <CopyBlock label="Descrição do grupo" text={withSite(GROUP_SETUP.description)} />
          <p>Regras (adicione uma por uma):</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {GROUP_SETUP.rules.map((r) => <CopyBlock key={r.title} label={r.title} text={r.text} />)}
          </div>
          <p>Perguntas para quem pede para entrar (no máximo 3):</p>
          {GROUP_SETUP.questions.map((q, i) => <CopyBlock key={q} label={`Pergunta ${i + 1}`} text={q} />)}
          <p>
            A 3ª pergunta junta emails de quem quer o devocional. Quando alguém responder, adicione o email no site ou mande o link dos livros. Ative também o{" "}
            <b>Admin Assist</b> para recusar spam automaticamente.
          </p>
          <CopyBlock label="Post fixado (Start here)" text={withSite(GROUP_SETUP.pinned)} />
          <CopyBlock label="Post de boas-vindas (toda semana)" text={GROUP_SETUP.welcome} />
        </Step>

        <Step id="pinterest" title="Criar a conta do Pinterest e as pastas">
          <p>
            Crie uma conta <b>empresarial</b> em{" "}
            <a className="underline" href="https://business.pinterest.com" target="_blank" rel="noopener noreferrer">business.pinterest.com</a> (grátis), com o
            nome Elonai. O público do Pinterest nos EUA usa a plataforma como buscador: cada pin é uma porta para o site por meses.
          </p>
          <CopyBlock label="Bio do Pinterest" text={PROFILE.pinterestBio} />
          <CopyBlock label="Site" text={`${SITE}/?utm_source=pinterest&utm_campaign=profile`} />
          <p>Crie estas pastas (boards). Os posts do dia já dizem em qual pasta salvar cada pin:</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {BOARDS.map((b) => <CopyBlock key={b.name} label={b.name} text={b.description} />)}
          </div>
          <p>Para agendar, use o próprio Pinterest: ao criar o pin, escolha “Publicar mais tarde”.</p>
        </Step>

        <Step id="pinterest-claim" title="Verificar o site no Pinterest">
          <p>
            No Pinterest: <b>Configurações → Contas verificadas → Sites → Verificar</b>, método <b>tag HTML</b>. Copie só o código de dentro de{" "}
            <code>content=&quot;…&quot;</code> e cole na Vercel numa variável chamada <code>PINTEREST_SITE_VERIFICATION</code>. Faça um Redeploy e clique em
            Verificar. Com o site verificado, seus pins mostram seu nome e você vê as estatísticas de tudo que for salvo do site.
          </p>
        </Step>

        <Step id="instagram" title="Instagram (aproveitando as mesmas imagens)">
          <p>
            Crie uma conta profissional, conecte à Página (no Business Suite) e use a mesma imagem dos posts “com imagem”. O painel já traz a legenda do
            Instagram com hashtags.
          </p>
          <CopyBlock label="Bio do Instagram" text={PROFILE.instagramBio} />
          <CopyBlock label="Link da bio" text={`${SITE}/?utm_source=instagram&utm_campaign=bio`} />
          <p>Com o Instagram conectado, ative também o Threads com a mesma conta e reposte os textos curtos da manhã.</p>
        </Step>

        <Step id="site-links" title="Colocar as redes no site">
          <p>
            Em <Link className="underline" href="/admin/settings">Configurações</Link>, preencha os links da Página do Facebook, Pinterest e Instagram. Eles
            aparecem no rodapé do site.
          </p>
        </Step>
      </div>

      <h2 className="mt-14 text-3xl">2. A rotina</h2>
      <div className="mt-5 space-y-3 border border-line bg-white p-6 text-sm leading-relaxed text-ink-soft">
        <p><b>Domingo, cerca de 1 hora:</b> abra os posts da semana em <Link className="underline" href="/admin/social">Divulgação</Link>, gere as imagens no ChatGPT e agende:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Página + Instagram: 3 posts por dia no Planejador do Business Suite.</li>
          <li>Grupo: 1 post por dia, agendado no próprio grupo.</li>
          <li>Pinterest: 3 pins por dia, com “Publicar mais tarde”.</li>
        </ul>
        <p><b>Todo dia, 10 a 15 minutos:</b> cole o link no 1º comentário dos posts (se não agendou com ele), responda comentários e mensagens, aprove membros do grupo e ore pelos pedidos.</p>
        <p>
          <b>Por que não automatizar tudo:</b> a Meta desligou a publicação automática em grupos em 2024, e robôs que postam em grupos dos outros levam a
          bloqueio da conta (e você perderia a Página e o grupo junto). Agendar no Business Suite, no grupo e no Pinterest é permitido e dá quase o mesmo
          resultado.
        </p>
      </div>

      <h2 className="mt-14 text-3xl">3. Outras formas de crescer nos EUA</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          ["Grupos de outras pessoas", "Entre em 5 a 10 grupos cristãos grandes de mulheres. Leia as regras, ajude, ore pelos pedidos. Compartilhe um link só onde for permitido, no máximo 1 vez por semana em cada grupo e nunca o mesmo texto. Quem gostar de você vai procurar a Página."],
          ["Vídeos curtos", "Reels, YouTube Shorts e TikTok com o versículo do dia lido em voz alta sobre a imagem (15 a 30 segundos). É o formato que mais alcança gente nova hoje. Posso preparar os roteiros no painel quando quiser."],
          ["Igrejas e pequenos grupos", "Mande o link da página Small Groups do site para líderes de ministério de mulheres. Um líder que adota um livro traz o grupo inteiro."],
          ["Lista de email", "Quem baixa um livro entra na lista. Cada pessoa da lista vale mais que um seguidor: o email chega sem depender de algoritmo."],
          ["Google", "O Search Console já está ligado. Um artigo novo por semana sobre um tema que as pessoas pesquisam (ex.: “Bible verses for…”) traz visitas por anos."],
          ["Anúncio pago (opcional)", "US$ 3 a 5 por dia no Facebook/Instagram divulgando um livro grátis para mulheres nos EUA. A Meta não deixa segmentar por religião, então o próprio conteúdo é que encontra o público. Só vale depois que a rotina orgânica estiver rodando."],
        ].map(([t, d]) => (
          <div key={t} className="border border-line bg-white p-5">
            <h3 className="font-serif text-xl">{t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
