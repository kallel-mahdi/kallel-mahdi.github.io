# Teaching blocks for blog posts. Markdown (and math) works inside each block.
#
#   {% exercise Optional title %}
#   Question text.
#   {% hint %} A nudge. {% endhint %}
#   {% answer %} The worked answer. {% endanswer %}
#   {% endexercise %}
#
#   {% history Optional title %} A historical note. {% endhistory %}
#
# Exercises are numbered per page. Hints and answers render as collapsed
# <details>; their summary text can be overridden: {% hint Another hint %}.
# Styles live in _sass/site/_teaching.scss. See AUTHORING.md.

module Jekyll
  module Tags
    class TeachingBlock < Liquid::Block
      def initialize(tag_name, markup, tokens)
        super
        @title = markup.strip
      end

      def markdown(context, text)
        site = context.registers[:site]
        site.find_converter_instance(::Jekyll::Converters::Markdown).convert(text)
      end

      def inline_markdown(context, text)
        markdown(context, text).gsub(/<\/?p[^>]*>/, '').chomp
      end
    end

    class ExerciseTag < TeachingBlock
      def render(context)
        number = (context.registers[:exercise_count] ||= 0) + 1
        context.registers[:exercise_count] = number
        label = "Exercise #{number}"
        label += " · #{inline_markdown(context, @title)}" unless @title.empty?
        body = markdown(context, super)
        %(<div class="exercise" id="exercise-#{number}"><div class="exercise-label">#{label}</div>#{body}</div>)
      end
    end

    class RevealTag < TeachingBlock
      def render(context)
        summary = @title.empty? ? @tag_name.capitalize : inline_markdown(context, @title)
        body = markdown(context, super)
        %(<div class="reveal reveal-#{@tag_name}"><details><summary>#{summary}</summary><div class="reveal-body">#{body}</div></details></div>)
      end
    end

    class HistoryTag < TeachingBlock
      def render(context)
        label = 'History'
        label += " · #{inline_markdown(context, @title)}" unless @title.empty?
        body = markdown(context, super)
        %(<aside class="history"><div class="history-label">#{label}</div>#{body}</aside>)
      end
    end
  end
end

Liquid::Template.register_tag('exercise', Jekyll::Tags::ExerciseTag)
Liquid::Template.register_tag('hint', Jekyll::Tags::RevealTag)
Liquid::Template.register_tag('answer', Jekyll::Tags::RevealTag)
Liquid::Template.register_tag('history', Jekyll::Tags::HistoryTag)
